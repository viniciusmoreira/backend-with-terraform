import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { IAuthClient, IAuthTokens } from '../../modules/auth/interfaces/auth.interfaces';

export class CognitoClient implements IAuthClient {
  private client: CognitoIdentityProviderClient;
  private clientId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async signUp(email: string, password: string): Promise<void> {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
    });

    await this.client.send(command);
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
    });

    await this.client.send(command);
  }

  async signIn(email: string, password: string): Promise<IAuthTokens> {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await this.client.send(command);

    return {
      idToken: response.AuthenticationResult?.IdToken || '',
      expiresIn: response.AuthenticationResult?.ExpiresIn || 0,
    };
  }
}
