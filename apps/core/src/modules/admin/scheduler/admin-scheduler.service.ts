import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class AdminSchedulerService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  async getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    const result: any[] = [];
    jobs.forEach((value, key) => {
      let nextDate: string | null = null;
      try {
        nextDate = value.nextDate().toString();
      } catch (e) {}

      result.push({
        name: key,
        nextDate,
        running: (value as any).running,
        lastDate: value.lastDate()?.toString() || null,
      });
    });
    return result;
  }
}
