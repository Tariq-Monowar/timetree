// modules/project/routes/task.routes.ts

import { Router } from 'express';
import TaskController from './task.controller';
import { verifyUser } from '../../middleware/verifyUser';

const router = Router();

// Route: Create a new task
router.post('/:projectId', verifyUser, TaskController.createTask);

// Route: Get a task by ID
router.get('/:id', verifyUser, TaskController.getTaskById);

// Route: Get all tasks for a project
router.get('/project/:projectId', verifyUser, TaskController.getTasksByProject);

// Route: Update a task
router.put('/:id/:projectId', verifyUser, TaskController.updateTask);

// Route: Delete a task
router.delete('/:id/:projectId', verifyUser, TaskController.deleteTask);

router.put('/:id', verifyUser, TaskController.completeTask);

export default router;
