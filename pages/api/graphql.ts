import { ApolloServer } from "apollo-server-micro";
import { Database } from "arangojs";
import type { NextApiRequest, NextApiResponse } from "next";
import { me as meAccount } from "../../api/account/account";
import { login } from "../../api/login";
import typeDefs from "../../api/schema.graphql";
import { user as getUser, users as listUsers } from "../../api/users/users";

const db = new Database({
  url: "http://localhost:8529",
  databaseName: "abi22bg"
});

const resolvers = {
  Query: {
    me: meAccount,
    users: listUsers,
    user: getUser
  },
  Mutation: {
    login
  }
};

const apolloServer = new ApolloServer({
  typeDefs, resolvers, context: ({ req, res }: { req: NextApiRequest, res: NextApiResponse; }) => ({
    req, res, db
  })
});

const startServer = apolloServer.start();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
