import express from 'express';
import {
  getDocumentationByProject,
  getDocumentationBySlugName,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
} from '../controllers/documentation.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/:id/docs/:slug')
  .get(authMiddleware, getDocumentationBySlugName)
  .put(authMiddleware, updateDocumentation)
  .delete(authMiddleware, deleteDocumentation);

router
  .route('/:id')
  .get(authMiddleware, getDocumentationByProject)
  .post(authMiddleware, createDocumentation);

export default router;
