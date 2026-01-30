import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { ISSMClient, ISecretOutput } from '../interfaces/system.interfaces';

interface Input {
  parameterName: string;
}

export class GetSecretUseCase implements IUseCase<Input, ISecretOutput> {
  constructor(private readonly ssmClient: ISSMClient) {}

  async execute({ parameterName }: Input): Promise<ISecretOutput> {
    const secret = await this.ssmClient.getParameter(parameterName);
    return {
      secret,
      retrievedAt: new Date().toISOString(),
    };
  }
}
