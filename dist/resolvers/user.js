"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const argon2_1 = __importDefault(require("argon2"));
let usernamePasswordInput = class usernamePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], usernamePasswordInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], usernamePasswordInput.prototype, "password", void 0);
usernamePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], usernamePasswordInput);
let Error = class Error {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], Error.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], Error.prototype, "message", void 0);
Error = __decorate([
    (0, type_graphql_1.ObjectType)()
], Error);
let userResponse = class userResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Error], { nullable: true }),
    __metadata("design:type", Array)
], userResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], userResponse.prototype, "user", void 0);
userResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], userResponse);
let UserResolver = class UserResolver {
    async register(options, { em }) {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }
        if (options.password.length <= 3) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 3",
                    },
                ],
            };
        }
        const hashedPassword = await argon2_1.default.hash(options.password);
        const user = em.create(User_1.User, {
            username: options.username,
            password: hashedPassword,
        });
        try {
            await em.persistAndFlush(user);
        }
        catch (err) {
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        },
                    ],
                };
            }
        }
        return { user };
    }
    async login(options, { em }) {
        const user = await em.findOne(User_1.User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "that username doesn't exist",
                    },
                ],
            };
        }
        const valid = await argon2_1.default.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }
        return {
            user,
        };
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => userResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => userResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
