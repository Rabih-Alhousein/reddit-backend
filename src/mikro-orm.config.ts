import { isProd } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

console.log({ __dirname });

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Post],
  dbName: "reddit",
  password: "123",
  debug: !isProd,
  type: "postgresql",
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
