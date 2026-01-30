import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { registerSchema, confirmSchema, loginSchema } from './schemas/auth.schema';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', validate(registerSchema), controller.register);
  router.post('/confirm', validate(confirmSchema), controller.confirm);
  router.post('/login', validate(loginSchema), controller.login);

  return router;
}
