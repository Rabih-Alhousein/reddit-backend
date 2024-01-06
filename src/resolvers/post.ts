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
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middlewares/isAuth";
import { LessThan } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => [Post])
  posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cusror", { nullable: true }) cusror?: string
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);

    const query = Post.find({
      order: { createdAt: "DESC" },
      take: realLimit,
      where: cusror ? { createdAt: LessThan(new Date(cusror)) } : {},
    });

    return query;
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
