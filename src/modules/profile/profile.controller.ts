import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase
  ) {}

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.getProfileUseCase.execute({
        cognitoSub: req.user!.sub,
      });
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.updateProfileUseCase.execute({
        cognitoSub: req.user!.sub,
        data: req.body,
      });
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };
}
