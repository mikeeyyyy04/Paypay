import { Router } from 'express';
import {
  createClass,
  deleteClass,
  getPublicClass,
  listAdminClasses,
  listPublicClasses,
  updateClass,
} from '../controllers/class.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicClassRoutes = Router();
export const adminClassRoutes = Router();

publicClassRoutes.get('/', asyncHandler(listPublicClasses));
publicClassRoutes.get('/:slug', asyncHandler(getPublicClass));

adminClassRoutes.get('/', asyncHandler(requireAdmin), asyncHandler(listAdminClasses));
adminClassRoutes.post('/', asyncHandler(requireAdmin), asyncHandler(createClass));
adminClassRoutes.patch('/:classId', asyncHandler(requireAdmin), asyncHandler(updateClass));
adminClassRoutes.put('/:classId', asyncHandler(requireAdmin), asyncHandler(updateClass));
adminClassRoutes.delete('/:classId', asyncHandler(requireAdmin), asyncHandler(deleteClass));
