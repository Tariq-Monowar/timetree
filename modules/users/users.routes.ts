// modules/user/routes/user.routes.ts

import { Router } from "express";
import UserController from "./users.controller";
import { verifyUser } from "../../middleware/verifyUser";
// import { verifyUser } from "../../middleware/verifyUser";

const router = Router();
router.get("/check", UserController.checkAuthStatus);

router.get("/:id", UserController.getUserById);
router.get("/", UserController.getAllUsers);

router.post("/register", UserController.createUser);
router.post("/login", UserController.loginUser);
router.post("/logout", UserController.logout);



router.put("/update",verifyUser, UserController.updateUser);
router.delete("/", verifyUser, UserController.deleteUser);


export default router;
