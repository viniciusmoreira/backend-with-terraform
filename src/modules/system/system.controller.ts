import { Request, Response, NextFunction } from 'express';
import { HealthCheckUseCase } from './use-cases/health-check.use-case';
import { GetSecretUseCase } from './use-cases/get-secret.use-case';

export class SystemController {
  constructor(
    private readonly healthCheckUseCase: HealthCheckUseCase,
    private readonly getSecretUseCase: GetSecretUseCase
  ) {}

  healthCheck = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.healthCheckUseCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSecret = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getSecretUseCase.execute({
        parameterName: process.env.SSM_PARAMETER_NAME!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
