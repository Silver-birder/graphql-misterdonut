import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers/resolvers";

const typeDefs = readFileSync("./src/schema/schema.graphql", "utf8");

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
});

server.start();
