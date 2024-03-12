"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTokenIfExists = exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const { JWT_SECRET_KEY } = process.env;
const validateToken = async ({ context }, next) => {
    var _a;
    const token = (_a = context.req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        throw new Error("not authenticated");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log(err);
                throw new Error("not authenticated");
            }
            return decoded;
        });
        if (!decoded)
            throw new Error("not authenticated");
        const userId = decoded.userId;
        const user = await User_1.User.findOneBy({ id: userId });
        if (!user)
            throw new Error("not found user");
        context.req.user = user;
    }
    catch (err) {
        console.log(err);
        throw new Error("not authenticated");
    }
    return next();
};
exports.validateToken = validateToken;
// This middleware is used to validate the token if it exists. specifically for posts that are not protected by authentication.
// but if the token exists, it will be validated and the user will be added to the request object.
const validateTokenIfExists = async ({ context }, next) => {
    var _a;
    const token = (_a = context.req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY);
        if (decoded) {
            const userId = decoded.userId;
            const user = await User_1.User.findOneBy({ id: userId });
            if (user) {
                context.req.user = user;
            }
        }
    }
    return next();
};
exports.validateTokenIfExists = validateTokenIfExists;
