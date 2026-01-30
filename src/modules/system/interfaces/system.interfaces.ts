export interface ISSMClient {
  getParameter(name: string): Promise<string>;
}

export interface IHealthCheckOutput {
  status: string;
  timestamp: string;
}

export interface ISecretOutput {
  secret: string;
  retrievedAt: string;
}
