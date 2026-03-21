import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';
import { ERROR_CODES } from '../constants/error-codes.constants';

/**
 * ValidationPipe — global pipe using class-validator + class-transformer.
 * Rejects requests with invalid DTOs and returns typed error responses.
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const { metatype } = metadata;
    if (metatype === undefined || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype as ClassConstructor<object>, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints ?? {}),
      );
      throw new BadRequestException({
        message: messages,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }

    return object;
  }

  private toValidate(metatype: unknown): boolean {
    const primitives: unknown[] = [String, Boolean, Number, Array, Object];
    return !primitives.includes(metatype);
  }
}
