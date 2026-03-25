import { Injectable } from '@nestjs/common';
import { EVENT_NAMES } from '../../../events/event.constants';

@Injectable()
export class AdminEventsService {
  async getEventDefinitions() {
    return Object.entries(EVENT_NAMES).map(([key, value]) => ({
      key,
      name: value,
    }));
  }
}
