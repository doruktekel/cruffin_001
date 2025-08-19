import bcrypt from "bcryptjs";

export const hashPassword = async (pass) => {
  const hashedPassword = await bcrypt.hash(pass, 12);
  return hashedPassword;
};
