---
id: getting-started
title: Getting started
sidebar_label: Getting started
---

# Getting started

Welcome to the `@accounts` documentation. This suite of packages aims to provide the consumer an end to end solution authentication and accounts management, with a simple to start with interface and options for configuration. Out of the box these packages provide OAuth with popular providers (Instagram, Twitter), Two factor authentication, password accounts along with recovery options and customizable account creation and validation.

## Installation

The `@accounts` packages are modular by nature and can be manually installed and configured, however we provide a few helpful abstractions over several commonly used packages to provide the consumer a preconfigured accounts server.

**Quick install**

> npm install @accounts/boost @accounts/mongo

or

> yarn install @accounts/boost @accounts/mongo

and a database driver

> npm install @accounts/mongo

or

> yarn install @accounts/mongo

```javascript
import AccountsServer from `@accounts/boost`;

const accountsServer = new AccountsServer().listen()
```

**Manual install**

# About

The accounts-js organization develops and maintains a modular accounts system
for the javascript domain. The basic idea is to have authentication view,
business logic, transport and data storage separated to multiple packages so you
can opt in and out of parts of the account system, but the whole suite should
allow the user to have a complete, generic and customizable account system.

## Prior Art

This project is inspired by Meteor's accounts suite of packages. Meteor
framework had a plug and play approach for its monolithic framework that saved a
ton of work that is traditionally done by any development team, over and over
again. Meteor's accounts system had a couple of restrictions:

- First it was published in Meteor's "atmosphere" package repository and was
  dependent on the Meteor's build tool.
- Second, Meteor is built around DDP and so its accounts system was taking that
  for granted.
- Third, Meteor's dependency on MongoDB meant that the business logic was
  dependant on how the data is stored in the database.

## FAQ

Going into this project we asked ourselves (and were asked by others) a bunch of
questions that helped us define what this project is all about. This is part of
these questions: If you have a question that you think could shape this
project please PR this document or open an issue!

### Why wouldn't you just use passport??

We are not here to replace passport.js. Actually, in our vision, passport.js
will be one authentication method that you can plug in. Currently, the only
problem with passport.js in that regard is that it is designed to work with
connect middlewares and adapter code is needed to plug into let's say a WS
transport. We currently implemented our own local strategy just to make sense
out of basic accounts packages. In the near future it will be separated into its
own package.

### Why not refactor out the Meteor accounts suite?

Well, as explained above, Meteor's accounts system is tied to the data storage
and transport in a way that is actually harder to separate than rewriting with
those abstractions in mind. We do offer an adapter package that allows Meteor
applications an easy and gradual way to move out of Meteor's current accounts
system.

### Why do you use multiple mono-repos?

Early on we understood that a mono-repo is required in order to have a good
developer experience while adding any accounts logic. This also helps us keep the
codebase relatively small for using apps as you will not load in client code on
server apps and vice versa. Although having a mono repo is great, we feel that
someone maintaining the Redis package should not get notifications regarding
changes on the Mongo or React packages. If you are adding in a
feature that requires changes to the transport or the data store packages, we
recommend cloning all of the accounts-js packages into the same directory and just
open your IDE on that directory as project root.
