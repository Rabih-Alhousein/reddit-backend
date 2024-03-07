import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { HelloResolver } from "./resolvers/hello";
import "dotenv-safe/config";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { ExpressContext } from "apollo-server-express";
import path from "path";
import { Upvote } from "./entities/UpVote";

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

  // Initialize store.
  let redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });

  console.log({ __prod__ });

  // Initialize sesssion storage.
  app.use(
    session({
      name: COOKIE_NAME, // query id
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET as string,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // cookie is only accessible by the web server (not by javascript)
        secure: __prod__, // cookie is only sent to the server with an encrypted request over the HTTPS protocol
        sameSite: "lax", // cookie is not sent on cross-site requests (see https://owasp.org/www-community/SameSite)
        domain: __prod__ ? "reddithub.vercel.app" : undefined,
        // for localhost, set sameSite: "lax" and secure: false
        // for sandbox testing, set sameSite: "none" and secure: true
        // for production, set sameSite: "lax" and secure: true
      },
    })
  );

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
  app.set("trust proxy", !__prod__);

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main();
