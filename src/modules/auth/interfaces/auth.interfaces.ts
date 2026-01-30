export interface IAuthClient {
  signUp(email: string, password: string): Promise<void>;
  confirmSignUp(email: string, code: string): Promise<void>;
  signIn(email: string, password: string): Promise<IAuthTokens>;
}

export interface IAuthTokens {
  idToken: string;
  expiresIn: number;
}

export interface IRegisterInput {
  email: string;
  password: string;
}

export interface IConfirmInput {
  email: string;
  code: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterOutput {
  message: string;
}

export interface IConfirmOutput {
  message: string;
}

export interface ILoginOutput {
  token: string;
  expiresIn: number;
}
