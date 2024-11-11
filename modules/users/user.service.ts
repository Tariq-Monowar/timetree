// modules/user/services/user.service.ts

import bcrypt from "bcryptjs";
import User, { IUser } from "./users.model";
import { isEmail } from "validator";
import { sign, verify } from "jsonwebtoken";
import { Response } from "express";

interface IUserResponse {
  user: IUser;
  token: string;
}

export class UserService {
  async createUser(data: Partial<IUser>, res: Response): Promise<IUserResponse> {
    console.log(data)
    if (!data.name || !data.email || !data.password) {
        throw new Error("Name, email, and password are required");
    }
    
    if (data.email && !isEmail(data.email)) {
        throw new Error("Enter a valid email");
    }
    
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("Email already in use");
    }
    
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    
    const user = new User(data);
    const token = sign(
        { userId: user._id },
        process.env.WEBTOKEN_SECRET_KEY as string,
        { expiresIn: "30d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    await user.save();

    return { user, token };
}


async loginUser(data: Partial<IUser>, res: Response): Promise<IUserResponse> {
  if (!data.email || !data.password) {
      throw new Error("Email and password are required");
  }
  
  if (data.email && !isEmail(data.email)) {
      throw new Error("Enter a valid email");
  }

  const existingUser = await User.findOne({ email: data.email });
  if (!existingUser) {
      throw new Error("User not found");
  }


  const token = sign(
      { userId: existingUser._id },
      process.env.WEBTOKEN_SECRET_KEY as string,
      { expiresIn: "30d" }
  );

  res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return { user: existingUser, token };
}

  async findUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async findAllUsers(): Promise<IUser[]> {
    return User.find();
  }

  async updateUser(
    userId: string,
    data: Partial<IUser>
  ): Promise<IUser | null> {
    // If password is provided in update, hash it before updating
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return User.findByIdAndUpdate(userId, data, { new: true });
  }

  async deleteUser(userId: string): Promise<IUser | null> {
    return User.findByIdAndDelete(userId);
  }
}

export default new UserService();
