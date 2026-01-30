import { IUseCase } from '../../../shared/interfaces/use-case.interface';
import { IHealthCheckOutput } from '../interfaces/system.interfaces';

export class HealthCheckUseCase implements IUseCase<void, IHealthCheckOutput> {
  async execute(): Promise<IHealthCheckOutput> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
