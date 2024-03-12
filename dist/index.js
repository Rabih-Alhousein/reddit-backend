"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const ioredis_1 = __importDefault(require("ioredis"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const UpVote_1 = require("./entities/UpVote");
const User_1 = require("./entities/User");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
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
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: corsOptions });
    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });
};
main();
