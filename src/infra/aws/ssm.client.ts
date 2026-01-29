import { SSMClient as AWSSSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { ISSMClient } from '../../modules/system/interfaces/system.interfaces';

export class SSMClient implements ISSMClient {
  private client: AWSSSMClient;

  constructor() {
    this.client = new AWSSSMClient({
      region: process.env.AWS_REGION,
    });
  }

  async getParameter(name: string): Promise<string> {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });

    const response = await this.client.send(command);
    return response.Parameter?.Value || '';
  }
}
