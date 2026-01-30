import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IAuthClient, ILoginInput, ILoginOutput } from '../interfaces/auth.interfaces';
import { InvalidCredentialsError, UserNotConfirmedError } from '../errors/auth.errors';

export class LoginUseCase implements IUseCase<ILoginInput, ILoginOutput> {
  constructor(private readonly authClient: IAuthClient) {}

  async execute({ email, password }: ILoginInput): Promise<ILoginOutput> {
    try {
      const tokens = await this.authClient.signIn(email, password);
      return {
        token: tokens.idToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new InvalidCredentialsError();
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new UserNotConfirmedError();
      }
      throw error;
    }
  }
}
