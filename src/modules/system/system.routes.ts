import { Router } from 'express';
import { SystemController } from './system.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export function createSystemRoutes(controller: SystemController): Router {
  const router = Router();

  router.get('/health', controller.healthCheck);
  router.get('/secret', authMiddleware, controller.getSecret);

  return router;
}
