import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IProfileRepository, IUserProfile } from '../interfaces/profile.interfaces';

interface Input {
  cognitoSub: string;
}

export class GetProfileUseCase implements IUseCase<Input, IUserProfile> {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute({ cognitoSub }: Input): Promise<IUserProfile> {
    let profile = await this.profileRepository.findByCognitoSub(cognitoSub);

    if (!profile) {
      profile = await this.profileRepository.create(cognitoSub);
    }

    return profile;
  }
}
