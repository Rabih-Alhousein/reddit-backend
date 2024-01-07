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
import { LessThan } from "typeorm";
import { Upvote } from "../entities/UpVote";

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
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts> {
    const userId = req.session.userId;
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const posts = await Post.find({
      order: { createdAt: "DESC" },
      take: realLimitPlusOne,
      where: cursor ? { createdAt: LessThan(new Date(cursor)) } : {},
      relations: ["creator", "upvotes"],
    });

    // change upvoteStatus of user to 1 or -1 for each post
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        const upvote = await Upvote.findOne({
          where: { postId: post.id, userId },
        });

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
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ id });
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
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
