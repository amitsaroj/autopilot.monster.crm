import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';

import { ERROR_CODES } from '../constants/error-codes.constants';

/**
 * ParseUUIDPipe — validates that a route/query param is a valid UUID v4.
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException({
        message: `'${value}' is not a valid UUID`,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }
    return value;
  }
}
