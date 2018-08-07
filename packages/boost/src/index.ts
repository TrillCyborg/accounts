import {
  AccountsServer as _AccountsServer,
  AccountsServerOptions as _AccountsServerOptions,
} from '@accounts/server';
import { ApolloServer } from 'apollo-server';
import { createAccountsGraphQL } from '@accounts/graphql-api';
import { makeExecutableSchema } from 'graphql-tools';
import { merge, get } from 'lodash';
import * as mongoose from 'mongoose';
import { AuthenticationService } from '@accounts/types';
import { DatabaseManager } from '@accounts/database-manager';

export interface AccountsServerOptions extends _AccountsServerOptions {
  apolloServer?: ApolloServer;
  userResolvers: any;
  userTypeDefs: any;
  storage: {
    uri?: string;
  };
}

const defaultMongoUri = 'mongodb://localhost:27017/accounts-js';

export class AccountsServer extends _AccountsServer {
  public static readonly SERVER_PORT = 4003;
  public apolloServer: ApolloServer;

  constructor(options?: AccountsServerOptions) {
    // Determine which database package the consumer installed
    let db;

    if (require.resolve('@accounts/mongo')) {
      const MongoDBInterface = require('@accounts/mongo').default;
      mongoose.connect(get(options, ['storage', 'uri'], defaultMongoUri));

      const userStorage = new MongoDBInterface(mongoose.connection);

      db = new DatabaseManager({
        sessionStorage: userStorage,
        userStorage,
      });
    }

    const servicePackages: any = {};

    if (require.resolve('@accounts/password')) {
      const AccountsPassword = require('@accounts/password').default;
      servicePackages.password = new AccountsPassword(get(options, ['services', 'password']));
    }

    super(
      merge(
        {},
        {
          db,
          tokenSecret: 'SECRET',
        },
        // Consumer provided options
        options
      ),
      merge({}, servicePackages)
    );

    const accountsGraphQL = createAccountsGraphQL(this, { extend: false });

    const schema = makeExecutableSchema({
      typeDefs: [accountsGraphQL.typeDefs],
      resolvers: merge(accountsGraphQL.resolvers),
      schemaDirectives: {
        ...accountsGraphQL.schemaDirectives,
      },
    });

    const CustomApolloServer = (options &&
      options.apolloServer &&
      options.apolloServer) as ApolloServer;

    this.apolloServer =
      options && options.apolloServer
        ? CustomApolloServer
        : new ApolloServer({
            schema,
          });
  }

  public async listen(options: any = {}): Promise<any> {
    const res = await this.apolloServer.listen({
      ...options,
      port: options.port || AccountsServer.SERVER_PORT,
    });

    // tslint:disable-next-line no-console
    console.log(`Accounts GraphQL server running at ${res.url}`);

    return res;
  }
}

export default AccountsServer;
