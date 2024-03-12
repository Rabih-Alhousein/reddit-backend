import { ApolloServer, ExpressContext } from "apollo-server-express";
import RedisStore from "connect-redis";
import "dotenv-safe/config";
import express from "express";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/UpVote";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

const main = async () => {
  const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    poolSize: 10,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Upvote],
  });

  AppDataSource.initialize()
    .then(() => {
      AppDataSource.runMigrations();

      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  const app = express();

  const redisURL = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

  // Initialize client.
  const redis = new Redis(redisURL);

  redis.on("ready", () => {
    console.log("Connected to Redis");
  });

  redis.on("error", (err) => {
    console.error("Error connecting to Redis", err);
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: ExpressContext): MyContext => ({ req, res, redis }),
  });

  const corsOptions = {
    origin: [
      "https://studio.apollographql.com",
      process.env.FRONTEND_URL as string,
    ],
    credentials: true,
  };

  // solution link: https://stackoverflow.com/questions/69333408/express-session-does-not-set-cookie

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main();
