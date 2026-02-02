import { AppError } from "../../../shared/errors/base.error";

export class InvalidCredentialsError extends AppError {
  readonly statusCode = 401;
  readonly code = "INVALID_CREDENTIALS";

  constructor() {
    super("Invalid email or password");
  }
}

export class UserNotConfirmedError extends AppError {
  readonly statusCode = 403;
  readonly code = "USER_NOT_CONFIRMED";

  constructor() {
    super("User email not confirmed");
  }
}

export class UserAlreadyExistsError extends AppError {
  readonly statusCode = 409;
  readonly code = "USER_ALREADY_EXISTS";

  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class InvalidConfirmationCodeError extends AppError {
  readonly statusCode = 400;
  readonly code = "INVALID_CONFIRMATION_CODE";

  constructor() {
    super("Invalid or expired confirmation code!");
  }
}
