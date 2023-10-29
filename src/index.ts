import { MikroORM, RequiredEntityData } from "@mikro-orm/core";
import microOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { HelloResolver } from "./resolvers/hello";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import { isProd } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  // Initialize client.
  let redisClient = createClient();
  redisClient
    .connect()
    .then(() => console.log("Redis client connected"))
    .catch(console.error);

  // Initialize store.
  let redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  // Initialize sesssion storage.
  app.use(
    session({
      name: "qid", // query id
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: "keyboard cat",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // cookie is only accessible by the web server (not by javascript)
        secure: false, // cookie is only sent to the server with an encrypted request over the HTTPS protocol
        sameSite: "lax", // cookie is not sent on cross-site requests (see https://owasp.org/www-community/SameSite)
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
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  const corsOptions = {
    origin: ["https://studio.apollographql.com", "http://localhost:3000"],
    credentials: true,
  };

  // solution link: https://stackoverflow.com/questions/69333408/express-session-does-not-set-cookie
  app.set("trust proxy", !isProd);

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main();
