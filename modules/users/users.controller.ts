import { Request, Response } from "express";
import User from "./users.model";
import { isEmail } from "validator";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

interface CustomRequest extends Request {
  userId?: string;
}

class UserController {
  private hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(8);
    return await bcrypt.hash(password, salt);
  };

  private generateToken = (id: string): string => {
    return sign({ userId: id }, process.env.WEBTOKEN_SECRET_KEY as string, {
      expiresIn: "30d",
    });
  };

  // Helper method to set the token cookie
  private setTokenCookie = (res: Response, token: string): void => {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!(name && email && password)) {
        res.status(400).json({ message: "Please fill all required fields" });
        return;
      }

      if (!isEmail(email)) {
        res.status(400).json({ message: "Please enter a valid email address" });
        return;
      }

      const exuser = await User.findOne({ email }).exec();
      if (exuser) {
        res.status(400).json({ message: "Email already exists" });
        return;
      }

      const hashedPassword = await this.hashPassword(password);

      const newUser = new User({ name, email, password: hashedPassword });

      // Generate token
      const token = this.generateToken(newUser._id);

      // Set cookie with token
      this.setTokenCookie(res, token);

      await newUser.save();

      res.status(200).json({ token, user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json(error);
    }
  };

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!(email && password)) {
        res.status(400).json({ message: "Please fill all required fields" });
        return;
      }

      const user = await User.findOne({ email }).exec();

      if (!user) {
        res.status(400).json({ message: "user not found" });
        return;
      }

      const passwordMatch =
        user?.password && (await bcrypt.compare(password, user.password));

      if (!passwordMatch) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }

      const token = this.generateToken(user._id);

      // Set cookie with token
      this.setTokenCookie(res, token);

      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(400).json({ message: "user not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find();
      if (!users) {
        res.status(400).json({ mwssage: "user not found" });
        return;
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      // Hash the password if it exists in the request body
      if (req.body.password) {
        req.body.password = await this.hashPassword(req.body.password);
      }

      // Update the user by their ID
      const updatedUser = await User.findByIdAndUpdate(req.userId, req.body, {
        new: true,
      });

      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Return the updated user
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };

  deleteUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      let deletes = await User.findByIdAndDelete(req.userId);

      if (!deletes) {
        res.status(400).json({
          message: "sumthing is wrong",
        });
        return;
      }

      res.status(201).json({ message: "user delete successfully" });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  checkAuthStatus = async (req: Request, res: Response): Promise<void> => {
    const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY as string;

    try {
      const { token } = req.cookies;

      if (!token) {
        res.status(400).json({ authenticated: false });
        return;
      }

      // Verify the token
      verify(token, JWT_SECRET, async (err: any, decoded: any) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Invalid token", authenticated: false });
        }

        const userId = decoded.userId;

        // Fetch user information from the database if not in cache
        const userInfo = await User.findById(userId);
        if (!userInfo) {
          return res
            .status(404)
            .json({ message: "User not found", authenticated: false });
        }

        return res.status(200).json({ authenticated: true, user: userInfo });
      });
    } catch (error) {
      console.error("Error in checkAuthStatus:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  logout = (req: Request, res: Response) => {
    console.log("log");
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(400).json(error);
    }
  };
}

export default new UserController();
