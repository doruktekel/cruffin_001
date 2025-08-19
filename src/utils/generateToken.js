import jwt from "jsonwebtoken";

export const generateToken = (id, rememberMe) => {
  let token;

  if (rememberMe) {
    token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    return token;
  }

  token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  return token;
};
