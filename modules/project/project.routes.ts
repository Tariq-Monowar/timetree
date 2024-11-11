import { Router } from 'express';
import ProjectController from './project.controller';
import { verifyUser } from '../../middleware/verifyUser';

const router = Router();

// Route: Create a new project
router.post('/', verifyUser, ProjectController.createProject);

// Route: Get a project by ID
router.get('/:id', verifyUser, ProjectController.getProjectById);

// Route: Get all projects
router.get('/', verifyUser, ProjectController.getAllProjects);

// Route: Remove a user from a project
router.put('/:id/users', verifyUser, ProjectController.rejectUsersFromProject);
 

// Route: Update a project
router.put('/:id', verifyUser, ProjectController.updateProject);


router.post('/:id/users', verifyUser, ProjectController.addUserToProject);
 
router.put('/:id/users/role', verifyUser, ProjectController.updateUserRole);

// Route: Assign a task to a project
router.post('/:id/tasks', verifyUser, ProjectController.assignTask);

// Route: Delete a project
router.delete('/:id', verifyUser, ProjectController.deleteProject);




export default router;
