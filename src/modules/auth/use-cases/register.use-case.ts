import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IAuthClient, IRegisterInput, IRegisterOutput } from '../interfaces/auth.interfaces';
import { UserAlreadyExistsError } from '../errors/auth.errors';

export class RegisterUseCase implements IUseCase<IRegisterInput, IRegisterOutput> {
  constructor(private readonly authClient: IAuthClient) {}

  async execute({ email, password }: IRegisterInput): Promise<IRegisterOutput> {
    try {
      await this.authClient.signUp(email, password);
      return {
        message: 'User registered. Check your email for confirmation code.',
      };
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        throw new UserAlreadyExistsError(email);
      }
      throw error;
    }
  }
}
