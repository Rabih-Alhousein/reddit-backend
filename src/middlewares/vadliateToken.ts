import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

const { JWT_SECRET_KEY } = process.env;

export const validateToken: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const token = context.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    throw new Error("not authenticated");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY!, (err, decoded) => {
      if (err) {
        console.log(err);
        throw new Error("not authenticated");
      }
      return decoded;
    }) as any;

    if (!decoded) throw new Error("not authenticated");

    const userId = decoded.userId;

    const user = await User.findOneBy({ id: userId });

    if (!user) throw new Error("not found user");

    context.req.user = user;
  } catch (err) {
    console.log(err);
    throw new Error("not authenticated");
  }

  return next();
};

// This middleware is used to validate the token if it exists. specifically for posts that are not protected by authentication.
// but if the token exists, it will be validated and the user will be added to the request object.
export const validateTokenIfExists: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const token = context.req.headers["authorization"]?.split(" ")[1];

  if (token) {
    const decoded = jwt.verify(token, JWT_SECRET_KEY!) as any;

    if (decoded) {
      const userId = decoded.userId;

      const user = await User.findOneBy({ id: userId });

      if (user) {
        context.req.user = user;
      }
    }
  }

  return next();
};
