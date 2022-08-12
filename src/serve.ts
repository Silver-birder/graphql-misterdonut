import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers/resolvers";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { execute, ExecutionArgs, subscribe } from "graphql";

const typeDefs = readFileSync("./src/schema/schema.graphql", "utf8");

async function main() {
  const yogaApp = createServer({
    schema: {
      typeDefs,
      resolvers,
    },
    graphiql: {
      subscriptionsProtocol: 'WS', 
    },
  });
  
  const httpServer = await yogaApp.start();
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: yogaApp.getAddressInfo().endpoint,
  });
  
  type EnvelopedExecutionArgs = ExecutionArgs & {
    rootValue: {
      execute: typeof execute;
      subscribe: typeof subscribe;
    };
  };
  
  useServer(
    {
      execute: (args) =>
        (args as EnvelopedExecutionArgs).rootValue.execute(args),
      subscribe: (args) =>
        (args as EnvelopedExecutionArgs).rootValue.subscribe(args),
      onSubscribe: async (ctx, msg) => {
        const { schema, execute, subscribe, contextFactory, parse, validate } =
          yogaApp.getEnveloped(ctx);

        const args: EnvelopedExecutionArgs = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };

        const errors = validate(args.schema, args.document);
        if (errors.length) return errors;
        return args;
      },
    },
    wsServer,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});