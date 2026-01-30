import { PrismaClient } from '@prisma/client';
import { IProfileRepository, IUserProfile, IUpdateProfileInput } from '../interfaces/profile.interfaces';

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCognitoSub(sub: string): Promise<IUserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { cognitoSub: sub },
    });
  }

  async create(sub: string): Promise<IUserProfile> {
    return this.prisma.userProfile.create({
      data: { cognitoSub: sub },
    });
  }

  async update(sub: string, data: IUpdateProfileInput): Promise<IUserProfile | null> {
    return this.prisma.userProfile.update({
      where: { cognitoSub: sub },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }
}
