import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server } from "socket.io"; // Corrected import for Socket.IO
import http from "http";

import users from "./modules/users/users.routes";
import project from "./modules/project/project.routes";
import task from "./modules/task/task.routes";
import notification from "./modules/notification/notification.routes";


dotenv.config();

const app = express();

app.use(cors());

const server = http.createServer(app);

export const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['*'],
    methods: ["GET", "POST"],
  },
}); 

export const userSockets: { [key: string]: string } = {}; // A map to store userId to socketId mapping

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("register", (userId) => {
    userSockets[userId] = socket.id; // Store the mapping
    console.log(`User ${userId} is registered with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    // Find and remove the disconnected socket ID from the mapping
    for (const [userId, socketId] of Object.entries(userSockets)) {
      if (socketId === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
    console.log("User disconnected", socket.id);
  });
});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/users", users);
app.use("/project", project);
app.use("/task", task);
app.use("/notification", notification);


app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: `404 route not found`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: `500 Something broken!`,
    error: err.message,
  });
});

export default server;
