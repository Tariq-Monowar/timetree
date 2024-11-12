// modules/project/controllers/project.controller.ts

import { Request, Response } from "express";
import Project from "./project.models";
import Task from "../task/task.models";
import mongoose from "mongoose";


interface CustomRequest extends Request {
  userId?: string;
}

class ProjectController {
  // Create a new project
  createProject = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      // Assuming `req.user` contains the authenticated user's ID
      const { title, description, timeline, currency, amount } = req.body;
      const project = await (await Project.create({
        title,
        description,
        timeline,
        users: [
          {
            userId: req.userId, // setting the creator as admin
            role: "admin",
          },
        ],
        currency,
        amount,
      })).populate({
        path: "users.userId",
        select: "-password -skills -createdAt -updatedAt",
      })




      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error creating project", error });
    }
  };

  // Get a project by ID
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        res.status(400).json({ message: "project not found" });
        return;
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Get all projects
  getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {

      const project = await Project.find().populate({
        path: "users.userId",
        select: "-password -skills -createdAt -updatedAt", // Excludes the password field from user data
      });


      res.status(200).json(project);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Update a project
  updateProject = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      // Find and update the project only if the user is an admin or manager
      const updatedProject = await Project.findOneAndUpdate(
        {
          _id: req.params.id,
          users: {
            $elemMatch: {
              userId: req.userId,
              role: { $in: ["admin", "manager"] },
            },
          },
        },
        req.body,
        { new: true }
      ).populate({
        path: "users.userId",
        select: "-password -skills -createdAt -updatedAt",
      });

      if (!updatedProject) {
        res.status(403).json({
          message: "Unauthorized: Only admins and managers can update projects",
        });
        return;
      }
   
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Error updating project", error });
    }
  };

  // Delete a project
  deleteProject = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      // Find and delete the project only if the user is an admin or manager
      const deletedProject = await Project.findOneAndDelete({
        _id: req.params.id,
        users: {
          $elemMatch: {
            userId: req.userId,
            role: { $in: ["admin", "manager"] },
          },
        },
      });

      if (!deletedProject) {
        res.status(403).json({
          message: "Unauthorized: Only admins and managers can delete projects",
        });
        return;
      }

      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting project", error });
    }
  };

  // modules/project/controllers/project.controller.ts

  // Add a user to a project
  addUserToProject = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { userId, role } = req.body;
      const projectId = req.params.id;

      // Validate the role
      if (!["admin", "manager", "developer"].includes(role)) {
        res.status(400).json({ message: "Invalid role specified" });
        return;
      }

      // Update the project and add the user
      const updatedProject = await Project.findOneAndUpdate(
        {
          _id: projectId,
          "users.userId": { $ne: userId }, // Ensure user isn't already in project
        },
        {
          $addToSet: { users: { userId, role } },
        },
        { new: true }
      );

      if (!updatedProject) {
        res
          .status(400)
          .json({ message: "User already in project or project not found" });
        return;
      }

      // Find and populate only the newly added user
      const newUser = await Project.findOne(
        { _id: projectId, "users.userId": userId },
        { "users.$": 1 } // Use positional operator to return only the matched user
      ).populate({
        path: "users.userId",
        select: "_id name email",
      });
        
     
      if (newUser && newUser.users.length > 0) {
     
        console.log(newUser.users[0])
        res.status(200).json({
          message: "User added to project successfully",
          projectId: projectId,
          user: newUser.users[0], // Return only the newly added user
        });
      } else {
        res.status(404).json({ message: "Newly added user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding user to project", error });
    }
  };

  // Simplified and optimized updateUserRole method
  updateUserRole = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { userId, newRole } = req.body;
      const projectId = req.params.id;

      // Validate the new role
      if (!["admin", "manager", "developer"].includes(newRole)) {
        res.status(400).json({ message: "Invalid role specified" });
        return;
      }

      // Single query to check authorization and update the user's role
      const updatedProject = await Project.findOneAndUpdate(
        {
          _id: projectId,
          users: {
            $elemMatch: {
              userId: req.userId,
              role: { $in: ["admin", "manager"] },
            },
          },
          "users.userId": userId,
        },
        { "users.$.role": newRole },
        { new: true, projection: { _id: 1 } } // Return only the _id for a lightweight response
      );

      if (!updatedProject) {
        res
          .status(403)
          .json({ message: "Unauthorized or user not found in the project" });
        return;
      }

      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user role" });
    }
  };

  // Assign a task to a project
  assignTask = async (req: Request, res: Response): Promise<void> => {
    try {
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Add this method to your ProjectController class
  // Add this method to your ProjectController class

  rejectUsersFromProject = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { userIds } = req.body;
      const projectId = req.params.id;
      console.log(JSON.stringify(userIds));
      console.log(JSON.stringify(projectId));
      userIds.every((id: any) => typeof id === "string");
      console.log(Array.isArray(userIds));
      console.log(projectId);
      console.log(userIds);
      // Validate input
      if (
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        !userIds.every((id) => typeof id === "string")
      ) {
        res.status(400).json({
          message:
            "Invalid input: userIds should be a non-empty array of strings",
        });
        return;
      }

      // Ensure that the current user has the correct role
      const authorizedProject = await Project.findOne({
        _id: projectId,
        users: {
          $elemMatch: {
            userId: req.userId,
            role: { $in: ["admin", "manager"] },
          },
        },
      });

      if (!authorizedProject) {
        res.status(403).json({
          message: "Unauthorized: Only admins or managers can remove users",
        });
        return;
      }

      // Convert userIds to ObjectId instances and perform the update
      const objectIds = userIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId },
        { $pull: { users: { userId: { $in: objectIds } } } },
        { new: true }
      );
      console.log(objectIds);
      console.log(updatedProject);

      if (updatedProject) {
        res.status(200).json({
          message: "Users removed from project successfully",
          project: updatedProject,
        });
      } else {
        res
          .status(404)
          .json({ message: "Project not found or unable to update" });
      }
    } catch (error: any) {
      console.error("Error removing users from project:", error);
      res.status(500).json({
        message: "Error removing users from project",
        error: error.message,
      });
    }
  };
}

export default new ProjectController();
