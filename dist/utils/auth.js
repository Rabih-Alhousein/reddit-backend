import JsonWebTokenError from "jsonwebtoken";

const { JWT_SECRET_KEY } = process.env;

export const getUserIdFromJwt = (token) => {
  const decoded = JsonWebTokenError.verify(token, JWT_SECRET_KEY);
  return decoded.id;
};
