// import { verify } from "jsonwebtoken";
// import { NextFunction, Request, Response } from "express";
// import dotenv from "dotenv";

// interface CustomRequest extends Request {
//   userEmail?: string;
//   userId?: string;
// }

// dotenv.config();

// export const verifyUser = async (
//   req: CustomRequest, 
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {

//   const { token } = req.cookies;
//   const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY as string

//   if (!token) {
//     res.status(400).json({
//       message: "Unauthorized user",
//     });
//     return;
//   }

//   try {
//     const decodedToken = verify(token,JWT_SECRET) as { userEmail: string; userId: string };

//     req.userEmail = decodedToken.userEmail;
//     req.userId = decodedToken.userId;
//     next();

//   } catch (error) {
//     res.status(401).json({message: "Invalid token"});
//     return;
//   }
// };


import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

interface CustomRequest extends Request {
  userId?: string;
}

dotenv.config();

export const verifyUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { token } = req.cookies; // This should now be defined if cookies are parsed correctly
  const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY as string;

  if (!token) {
    res.status(400).json({
      message: "Unauthorized user",
    });
    return;
  }

  try {
    // Decoding only userId from the token
    const decodedToken = verify(token, JWT_SECRET) as { userId: string };

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

