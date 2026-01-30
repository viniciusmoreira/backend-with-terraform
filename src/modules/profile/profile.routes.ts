import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProfileSchema } from './schemas/profile.schema';

export function createProfileRoutes(controller: ProfileController): Router {
  const router = Router();

  router.get('/', authMiddleware, controller.getProfile);
  router.put('/', authMiddleware, validate(updateProfileSchema), controller.updateProfile);

  return router;
}
