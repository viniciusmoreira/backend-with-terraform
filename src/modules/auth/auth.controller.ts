import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from './use-cases/register.use-case';
import { ConfirmUseCase } from './use-cases/confirm.use-case';
import { LoginUseCase } from './use-cases/login.use-case';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly confirmUseCase: ConfirmUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.confirmUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
