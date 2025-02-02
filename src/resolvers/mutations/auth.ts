import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const authResolvers = {
  signUp: async (parent: any, arg: any, context: any) => {
    const { prisma } = context;

    const isExist = await prisma.user.findFirst({
      where: { email: arg.email },
    });

    if (isExist) {
      return {
        user: null,
        token: null,
      };
    }

    const hashedPassword = await bcrypt.hash(arg.password, 12);
    const newUser = await prisma.user.create({
      data: {
        ...arg,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, "secret", {
      expiresIn: "1d",
    });

    return {
      newUser,
      token,
    };
  },

  signIn: async (parent: any, arg: any, context: any) => {
    const { prisma } = context;

    const user = await prisma.user.findFirst({ where: { email: arg.email } });

    if (!user)
      return {
        token: null,
      };

    const isPasswordMatch = await bcrypt.compare(arg.password, user.password);

    if (!isPasswordMatch) return { token: null };

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );
    return {
      token: token,
      user: user,
    };
  },
};
