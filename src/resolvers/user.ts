import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { usernamePasswordInput } from "./usernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import jwt from "jsonwebtoken";
import { validateToken } from "../middlewares/vadliateToken";

@ObjectType()
class Error {
  @Field()
  field!: string;
  @Field()
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => String, { nullable: true })
  accessToken?: string;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.user?.id === user.id) {
      return user.email;
    }

    // current user wants to see someone elses email
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = `${FORGET_PASSWORD_PREFIX}${token}`;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOneBy({ id: userIdNum });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      {
        id: userIdNum,
      },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY ?? ""
    );

    return { user, accessToken };
  }
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      `${FORGET_PASSWORD_PREFIX}${token}`,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3 // 3 day
    );

    const message = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;

    // TODO: fix send email
    // await sendEmail(email, message);

    return true;
  }
  @Query(() => User, { nullable: true })
  @UseMiddleware(validateToken)
  me(@Ctx() { req }: MyContext) {
    return req.user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: usernamePasswordInput
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return {
        errors,
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    try {
      const user = await User.create({
        email: options.email,
        username: options.username,
        password: hashedPassword,
      }).save();

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY ?? ""
      );

      return { user, accessToken };
    } catch (err: any) {
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

    return {
      errors: [
        {
          field: "username",
          message: "something went wrong",
        },
      ],
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "user doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

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

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY ?? ""
    );

    return {
      accessToken,
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req }: MyContext) {
    if (req.user) {
      req.user = undefined;
    }

    return true;
  }
}
