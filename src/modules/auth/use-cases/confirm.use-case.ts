import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IAuthClient, IConfirmInput, IConfirmOutput } from '../interfaces/auth.interfaces';
import { InvalidConfirmationCodeError } from '../errors/auth.errors';

export class ConfirmUseCase implements IUseCase<IConfirmInput, IConfirmOutput> {
  constructor(private readonly authClient: IAuthClient) {}

  async execute({ email, code }: IConfirmInput): Promise<IConfirmOutput> {
    try {
      await this.authClient.confirmSignUp(email, code);
      return {
        message: 'Email confirmed. You can now login.',
      };
    } catch (error: any) {
      if (error.name === 'CodeMismatchException' || error.name === 'ExpiredCodeException') {
        throw new InvalidConfirmationCodeError();
      }
      throw error;
    }
  }
}
