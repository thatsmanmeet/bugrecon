import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getProjectById,
  getProjects,
  createProject,
  updateProjectDetails,
  deleteProject,
  sendInvitation,
  InvitationAction,
  getSentInvites,
  getReceivedInvites,
  promoteMemberToAdmin,
  removeMemberFromProject,
  demoteAdminToMember,
} from '../controllers/project.controller.js';
const router = express.Router();

router
  .route('/')
  .get(authMiddleware, getProjects)
  .post(authMiddleware, createProject);

router.get('/invite/sent', authMiddleware, getSentInvites);
router.get('/invite/received', authMiddleware, getReceivedInvites);
router.post('/invite/respond/:id', authMiddleware, InvitationAction);
router.post('/invite/:id', authMiddleware, sendInvitation);

router
  .route('/:id')
  .get(authMiddleware, getProjectById)
  .patch(authMiddleware, updateProjectDetails)
  .delete(authMiddleware, deleteProject);

router.post('/:id/promote', authMiddleware, promoteMemberToAdmin);
router.post('/:id/demote', authMiddleware, demoteAdminToMember);
router.post('/:id/remove', authMiddleware, removeMemberFromProject);

export default router;
