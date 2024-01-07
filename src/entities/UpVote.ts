import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value!: number;

  @Field()
  @PrimaryColumn()
  userId!: number;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Post;

  @Field()
  @CreateDateColumn()
  createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt?: Date;
}
