import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  createComment,
  deleteComment,
  getCommentsForIssue,
  updateComment,
} from '../controllers/comment.controller.js';
const router = express.Router();

router
  .route('/issue/:id')
  .get(authMiddleware, getCommentsForIssue)
  .post(authMiddleware, createComment);

router
  .route('/:id')
  .put(authMiddleware, updateComment)
  .delete(authMiddleware, deleteComment);

export default router;
