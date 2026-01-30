import { AppError } from '../../../shared/errors/base.error';

export class ProfileNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'PROFILE_NOT_FOUND';

  constructor() {
    super('Profile not found');
  }
}
