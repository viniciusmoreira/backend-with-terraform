import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createContainer, Container } from './infra/factories';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { createProfileRoutes } from './modules/profile/profile.routes';
import { createSystemRoutes } from './modules/system/system.routes';
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware';

export function createApp(container: Container) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use('/auth', createAuthRoutes(container.authController));
  app.use('/profile', createProfileRoutes(container.profileController));
  app.use('/system', createSystemRoutes(container.systemController));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandlerMiddleware);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

export { createContainer };
