import { Field, InputType } from "type-graphql";

@InputType()
export class usernamePasswordInput {
  @Field()
  email!: string;
  @Field()
  username!: string;
  @Field()
  password!: string;
}
