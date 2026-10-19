import { Repository } from 'typeorm';
import { Plan } from '../../database/entities/plan.entity';
import { PlanFeature } from '../../database/entities/plan-feature.entity';
import { PlanLimit } from '../../database/entities/plan-limit.entity';
import { PricingRepository } from './pricing.repository';

describe('PricingRepository.findAllPlans', () => {
  it('returns only active plans published for public discovery', async () => {
    const plans = { find: jest.fn().mockResolvedValue([]) };
    const repository = new PricingRepository(
      plans as unknown as Repository<Plan>,
      {} as Repository<PlanFeature>,
      {} as Repository<PlanLimit>,
    );

    await repository.findAllPlans();

    expect(plans.find).toHaveBeenCalledWith({
      where: { status: 'ACTIVE', isPublic: true },
      order: { sortOrder: 'ASC' },
    });
  });
});
