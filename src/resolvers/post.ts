import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middlewares/isAuth";
import { LessThan, ILike } from "typeorm";
import { Upvote } from "../entities/UpVote";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post) {
    return User.findOneBy({ id: post.creatorId });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    if (![1, -1].includes(value)) {
      throw new Error("value must be 1 or -1");
    }

    const { userId } = req.session;

    const post = await Post.findOneBy({ id: postId });

    if (!post) {
      return false;
    }

    const upvote = await Upvote.findOne({ where: { postId, userId } });

    if (upvote) {
      // user has voted on the post before and is changing their vote
      if (upvote.value !== value) {
        await Upvote.update({ postId, userId }, { value });
        post.points = post.points + 2 * value;
        await Post.save(post);

        return true;
      }

      // user has voted and is voting the same value
      await Upvote.delete({ postId, userId });
      post.points = post.points - value;
      await Post.save(post);

      return true;
    }

    // has never voted before
    await Upvote.create({
      userId,
      postId,
      value,
    }).save();

    // update post points
    post.points = post.points + value;
    await Post.save(post);

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Ctx() { req }: MyContext,
    @Arg("search", { nullable: true }) search: string,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts> {
    const userId = req.session.userId;
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const whereOptions = {} as any;
    if (search) {
      whereOptions.title = ILike(`%${search}%`);
    }

    if (cursor) {
      whereOptions.createdAt = LessThan(new Date(cursor));
    }

    const posts = await Post.find({
      order: { createdAt: "DESC" },
      take: realLimitPlusOne,
      where: whereOptions,
      relations: ["upvotes"],
    });

    // change upvoteStatus of user to 1 or -1 for each post
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        let upvote;

        if (userId) {
          upvote = await Upvote.findOne({ where: { postId: post.id, userId } });
        }

        post.voteStatus = upvote ? upvote.value : null;

        return post;
      })
    );

    return {
      posts: updatedPosts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    if (!req.session.userId) {
      throw new Error("not authenticated");
    }

    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { req }: MyContext,
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }

    await Post.update({ id }, { title, text });

    const updatedPost = await Post.findOneBy({ id });

    return updatedPost;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      throw new Error("post not found");
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }

    await Upvote.delete({ postId: id });
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
