import { createPubSub } from "@graphql-yoga/node";
import { db } from "./db";

const pubSub = createPubSub();

export const resolvers = {
  Query: {
    donuts: (_: any, { query }: { query: { name: string } }) => {
      const { name } = query;
      if (name) {
        const searchName = new RegExp(name);
        return db.donuts.filter((d: any) => searchName.test(d.name));
      } else {
        return db.donuts;
      }
    },
    donut: (_: any, { id }: { id: number }) => {
      const donutIndex = db.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = db.donuts[donutIndex];
      return donut;
    },
  },
  Mutation: {
    addDonut: (_: any, { input }: { input: any }) => {
      const donut = {
        id: db.donuts.length + 1,
        name: input.name,
        price: input.price,
      };
      db.donuts.push(donut);
      pubSub.publish("addDonut", donut);
      return donut;
    },
    editDonut: (_: any, { id, input }: { id: number; input: any }) => {
      const donutIndex = db.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = db.donuts[donutIndex];
      donut.name = input.name;
      donut.price = input.price;
      db.donuts[donutIndex] = donut;
      pubSub.publish("editDonut", id, donut);
      return donut;
    },
    deleteDonut: (_: any, { id }: { id: number }) => {
      const donutIndex = db.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = db.donuts[donutIndex];
      db.donuts.splice(donutIndex, 1);
      pubSub.publish("deleteDonut", id, donut);
      return donut;
    },
  },
  Subscription: {
    addDonut: {
      subscribe: () => pubSub.subscribe("addDonut"),
      resolve: (payload: any) => payload,
    },
    editDonut: {
      subscribe: (_: any, { id }: { id: number }) => {
        return pubSub.subscribe("editDonut", id);
      },
      resolve: (payload: any) => payload,
    },
    deleteDonut: {
      subscribe: (_: any, { id }: { id: number }) =>
        pubSub.subscribe("deleteDonut", id),
      resolve: (payload: any) => payload,
    },
  },
};
