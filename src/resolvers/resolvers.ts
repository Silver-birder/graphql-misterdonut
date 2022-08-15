import { createPubSub } from "@graphql-yoga/node";
import { categoryKVS, donutsDB } from "./db";

const pubSub = createPubSub();

const donutWithCategory = (donut: any) => {
  const category_id = donut.category_id;
  //@ts-ignore
  const category = categoryKVS[category_id];
  donut["category"] = category;
  return donut;
};

export const resolvers = {
  Query: {
    donuts: (_: any, { query }: { query: { name: string } }) => {
      const { name } = query;
      if (name) {
        const searchName = new RegExp(name);
        return donutsDB.donuts
          .filter((d: any) => searchName.test(d.name))
          .map(donutWithCategory);
      } else {
        return donutsDB.donuts.map(donutWithCategory);
      }
    },
    donut: (_: any, { id }: { id: number }) => {
      const donutIndex = donutsDB.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = donutsDB.donuts[donutIndex];
      return donutWithCategory(donut);
    },
  },
  Mutation: {
    addDonut: (_: any, { input }: { input: any }) => {
      const donut = {
        id: donutsDB.donuts.length + 1,
        name: input.name,
        price: input.price,
        category_id: 1,
      };
      donutsDB.donuts.push(donut);
      pubSub.publish("addDonut", donut);
      return donutWithCategory(donut);
    },
    editDonut: (_: any, { id, input }: { id: number; input: any }) => {
      const donutIndex = donutsDB.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = donutsDB.donuts[donutIndex];
      donut.name = input.name;
      donut.price = input.price;
      donutsDB.donuts[donutIndex] = donut;
      pubSub.publish("editDonut", id, donut);
      return donutWithCategory(donut);
    },
    editCategory: (
      _: any,
      { id, input }: { id: number; input: { name: string } }
    ) => {
      //@ts-ignore
      categoryKVS[id] = { id, name: input.name };
      //@ts-ignore
      return categoryKVS[id];
    },
    deleteDonut: (_: any, { id }: { id: number }) => {
      const donutIndex = donutsDB.donuts.findIndex((donut: any) => donut.id === id);
      if (donutIndex === -1) {
        return null;
      }
      const donut = donutsDB.donuts[donutIndex];
      donutsDB.donuts.splice(donutIndex, 1);
      pubSub.publish("deleteDonut", id, donut);
      return donutWithCategory(donut);
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
