import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  createIssue,
  deleteIssue,
  getIssueById,
  getMyIssues,
  updateIssue,
  getProjectIssues,
} from '../controllers/issue.controller.js';
const router = express.Router();

router.route('/my').get(authMiddleware, getMyIssues);

router
  .route('/project/:id')
  .post(authMiddleware, createIssue)
  .get(authMiddleware, getProjectIssues);

router
  .route('/:id')
  .get(authMiddleware, getIssueById)
  .put(authMiddleware, updateIssue)
  .delete(authMiddleware, deleteIssue);

export default router;
