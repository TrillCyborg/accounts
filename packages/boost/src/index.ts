import { AccountsServer as _AccountsServer, AccountsServerOptions } from '@accounts/server';
import { ApolloServer } from 'apollo-server';
import { createAccountsGraphQL, accountsContext } from '@accounts/graphql-api';
import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { merge, get } from 'lodash';
import * as mongoose from 'mongoose';
// import { AuthenticationService } from '@accounts/types';
import { DatabaseManager } from '@accounts/database-manager';

export { AccountsServerOptions };

export interface AccountsBoostServerOptions extends AccountsServerOptions {
  storage?: {
    uri?: string;
  };
}

const defaultMongoUri = 'mongodb://localhost:27017/accounts-js';

export interface AccountsGraphQL {
  schema: GraphQLSchema;
  typeDefs: string;
  resolvers: {
    [x: string]: any;
  };
  schemaDirectives: {
    auth: any;
  };
  accountsContext: any;
}

export class AccountsServer {
  public static readonly SERVER_PORT = 4003;
  public apolloServer: ApolloServer;
  public accountsServer: _AccountsServer;

  constructor(options?: AccountsBoostServerOptions) {
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

    this.accountsServer = new _AccountsServer(
      merge(
        {},
        {
          db,
        },
        // Consumer provided options
        options
      ),
      merge({}, servicePackages)
    );

    this.apolloServer = new ApolloServer({
      schema: this.graphql().schema,
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

  public graphql(): AccountsGraphQL {
    const accountsGraphQL = createAccountsGraphQL(this.accountsServer, { extend: true });

    const schema = makeExecutableSchema({
      typeDefs: [createAccountsGraphQL(this.accountsServer, { extend: false }).typeDefs],
      resolvers: merge(accountsGraphQL.resolvers),
      schemaDirectives: {
        ...accountsGraphQL.schemaDirectives,
      },
    });

    return {
      schema,
      accountsContext,
      ...accountsGraphQL,
    };
  }
}

export default AccountsServer;
