export interface IUserProfile {
  id: string;
  cognitoSub: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
}

export interface IProfileRepository {
  findByCognitoSub(sub: string): Promise<IUserProfile | null>;
  create(sub: string): Promise<IUserProfile>;
  update(sub: string, data: IUpdateProfileInput): Promise<IUserProfile | null>;
}

export interface IUpdateProfileInput {
  firstName?: string;
  lastName?: string;
}
