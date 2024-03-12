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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const typeorm_1 = require("typeorm");
const UpVote_1 = require("../entities/UpVote");
const User_1 = require("../entities/User");
const vadliateToken_1 = require("../middlewares/vadliateToken");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 150);
    }
    creator(post) {
        return User_1.User.findOneBy({ id: post.creatorId });
    }
    async vote(postId, value, { req }) {
        var _a;
        if (![1, -1].includes(value)) {
            throw new Error("value must be 1 or -1");
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log({ userId, postId, value });
        const post = await Post_1.Post.findOneBy({ id: postId });
        if (!post) {
            return false;
        }
        const upvote = await UpVote_1.Upvote.findOne({ where: { postId, userId } });
        if (upvote) {
            // user has voted on the post before and is changing their vote
            if (upvote.value !== value) {
                await UpVote_1.Upvote.update({ postId, userId }, { value });
                post.points = post.points + 2 * value;
                await Post_1.Post.save(post);
                return true;
            }
            // user has voted and is voting the same value
            await UpVote_1.Upvote.delete({ postId, userId });
            post.points = post.points - value;
            await Post_1.Post.save(post);
            return true;
        }
        // has never voted before
        await UpVote_1.Upvote.create({
            userId,
            postId,
            value,
        }).save();
        // update post points
        post.points = post.points + value;
        await Post_1.Post.save(post);
        return true;
    }
    async posts({ req }, search, limit, cursor) {
        var _a;
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log({ userId });
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const whereOptions = {};
        if (search) {
            whereOptions.title = (0, typeorm_1.ILike)(`%${search}%`);
        }
        if (cursor) {
            whereOptions.createdAt = (0, typeorm_1.LessThan)(new Date(cursor));
        }
        const posts = await Post_1.Post.find({
            order: { createdAt: "DESC" },
            take: realLimitPlusOne,
            where: whereOptions,
            relations: ["upvotes"],
        });
        // change upvoteStatus of user to 1 or -1 for each post
        const updatedPosts = await Promise.all(posts.map(async (post) => {
            let upvote;
            if (userId) {
                upvote = await UpVote_1.Upvote.findOne({ where: { postId: post.id, userId } });
            }
            post.voteStatus = upvote ? upvote.value : null;
            console.log(upvote);
            return post;
        }));
        return {
            posts: updatedPosts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    post(id) {
        return Post_1.Post.findOne({ where: { id } });
    }
    async createPost(input, { req }) {
        var _a;
        return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id })).save();
    }
    async updatePost({ req }, id, title, text) {
        var _a;
        const post = await Post_1.Post.findOneBy({ id });
        if (!post) {
            return null;
        }
        if (post.creatorId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error("not authorized");
        }
        await Post_1.Post.update({ id }, { title, text });
        const updatedPost = await Post_1.Post.findOneBy({ id });
        return updatedPost;
    }
    async deletePost(id, { req }) {
        var _a, _b;
        const post = await Post_1.Post.findOneBy({ id });
        if (!post) {
            throw new Error("post not found");
        }
        if (post.creatorId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error("not authorized");
        }
        await UpVote_1.Upvote.delete({ postId: id });
        await Post_1.Post.delete({ id, creatorId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id });
        return true;
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateToken),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateTokenIfExists),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("search", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(3, (0, type_graphql_1.Arg)("cursor", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateToken),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateToken),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateToken),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)("title")),
    __param(3, (0, type_graphql_1.Arg)("text")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(vadliateToken_1.validateToken),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
