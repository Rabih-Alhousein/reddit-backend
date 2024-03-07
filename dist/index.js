"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const hello_1 = require("./resolvers/hello");
require("dotenv-safe/config");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const constants_1 = require("./constants");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const UpVote_1 = require("./entities/UpVote");
const main = async () => {
    const AppDataSource = new typeorm_1.DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        poolSize: 10,
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [Post_1.Post, User_1.User, UpVote_1.Upvote],
    });
    AppDataSource.initialize()
        .then(() => {
        AppDataSource.runMigrations();
        console.log("Data Source has been initialized!");
    })
        .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
    const app = (0, express_1.default)();
    const redisURL = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    // Initialize client.
    const redis = new ioredis_1.default(redisURL);
    redis.on("ready", () => {
        console.log("Connected to Redis");
    });
    redis.on("error", (err) => {
        console.error("Error connecting to Redis", err);
    });
    // Initialize store.
    let redisStore = new connect_redis_1.default({
        client: redis,
        disableTouch: true,
    });
    console.log({ __prod__: constants_1.__prod__ });
    const domain = constants_1.__prod__ ? "reddithub.vercel.app" : undefined;
    console.log({ domain });
    // Initialize sesssion storage.
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME, // query id
        store: redisStore,
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly: true, // cookie is only accessible by the web server (not by javascript)
            secure: constants_1.__prod__, // cookie is only sent to the server with an encrypted request over the HTTPS protocol
            sameSite: "none", // cookie is not sent on cross-site requests (see https://owasp.org/www-community/SameSite)
            domain,
            // for localhost, set sameSite: "lax" and secure: false
            // for sandbox testing, set sameSite: "none" and secure: true
            // for production, set sameSite: "none" and secure: true
        },
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });
    const corsOptions = {
        origin: [
            "https://studio.apollographql.com",
            process.env.FRONTEND_URL,
        ],
        credentials: true,
    };
    // solution link: https://stackoverflow.com/questions/69333408/express-session-does-not-set-cookie
    app.set("trust proxy", !constants_1.__prod__);
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: corsOptions });
    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });
};
main();
