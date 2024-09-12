import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import fs from "fs";
import gql from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServerPluginInlineTrace } from "@apollo/server/plugin/inlineTrace";
import { ApolloServerPluginUsageReportingDisabled } from "@apollo/server/plugin/disabled";
import { experiences } from "./experiences.data.js";

const schemaDocument = gql`
  ${fs.readFileSync("schema.graphql", { encoding: "utf-8" })}
`;

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  plugins: [
    ApolloServerPluginInlineTrace({
      includeErrors: { unmodified: true },
    }),
    ApolloServerPluginUsageReportingDisabled(),
  ],
  schema: buildSubgraphSchema({
    typeDefs: schemaDocument,
    resolvers: {
      Query: {
        experiences: () => experiences,
      },
      Mutation: {
        submitInsightsExperienceLevel() {
          return true;
        },
      },
      Exoplanet: {
        experience(parent: any) {
          return experiences.find((e) => e.destinationId === parent.id);
        },
        __resolveReference(rep) {
          return rep;
        },
      },
    },
  }),
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT ? parseInt(process.env.PORT) : 4002 },
});

console.log(`🚀  Server ready at: ${url}`);
