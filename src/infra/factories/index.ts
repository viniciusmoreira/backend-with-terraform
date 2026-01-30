import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { CognitoClient } from '../aws/cognito.client';
import { SSMClient } from '../aws/ssm.client';

import { ProfileRepository } from '../../modules/profile/repositories/profile.repository';

import { GetProfileUseCase } from '../../modules/profile/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../modules/profile/use-cases/update-profile.use-case';

import { RegisterUseCase } from '../../modules/auth/use-cases/register.use-case';
import { ConfirmUseCase } from '../../modules/auth/use-cases/confirm.use-case';
import { LoginUseCase } from '../../modules/auth/use-cases/login.use-case';

import { HealthCheckUseCase } from '../../modules/system/use-cases/health-check.use-case';
import { GetSecretUseCase } from '../../modules/system/use-cases/get-secret.use-case';

import { ProfileController } from '../../modules/profile/profile.controller';
import { AuthController } from '../../modules/auth/auth.controller';
import { SystemController } from '../../modules/system/system.controller';

export interface Container {
  prisma: PrismaClient;
  profileController: ProfileController;
  authController: AuthController;
  systemController: SystemController;
}

export function createContainer(): Container {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const cognitoClient = new CognitoClient();
  const ssmClient = new SSMClient();

  const profileRepository = new ProfileRepository(prisma);

  const getProfileUseCase = new GetProfileUseCase(profileRepository);
  const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);

  const registerUseCase = new RegisterUseCase(cognitoClient);
  const confirmUseCase = new ConfirmUseCase(cognitoClient);
  const loginUseCase = new LoginUseCase(cognitoClient);

  const healthCheckUseCase = new HealthCheckUseCase();
  const getSecretUseCase = new GetSecretUseCase(ssmClient);

  const profileController = new ProfileController(getProfileUseCase, updateProfileUseCase);
  const authController = new AuthController(registerUseCase, confirmUseCase, loginUseCase);
  const systemController = new SystemController(healthCheckUseCase, getSecretUseCase);

  return {
    prisma,
    profileController,
    authController,
    systemController,
  };
}
