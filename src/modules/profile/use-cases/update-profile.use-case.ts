import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IProfileRepository, IUserProfile, IUpdateProfileInput } from '../interfaces/profile.interfaces';
import { ProfileNotFoundError } from '../errors/profile.errors';

interface Input {
  cognitoSub: string;
  data: IUpdateProfileInput;
}

export class UpdateProfileUseCase implements IUseCase<Input, IUserProfile> {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute({ cognitoSub, data }: Input): Promise<IUserProfile> {
    const existingProfile = await this.profileRepository.findByCognitoSub(cognitoSub);

    if (!existingProfile) {
      throw new ProfileNotFoundError();
    }

    const updatedProfile = await this.profileRepository.update(cognitoSub, data);

    if (!updatedProfile) {
      throw new ProfileNotFoundError();
    }

    return updatedProfile;
  }
}
