import { ValidationPipe } from '../../src/common/pipes/validation.pipe';
import { ParseUUIDPipe } from '../../src/common/pipes/parse-uuid.pipe';
import { BadRequestException } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

class TestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should pass valid DTO', async () => {
    const result = await pipe.transform(
      { name: 'John' },
      { metatype: TestDto, type: 'body', data: '' },
    );
    expect((result as TestDto).name).toBe('John');
  });

  it('should throw BadRequestException for invalid DTO', async () => {
    await expect(
      pipe.transform({ name: '' }, { metatype: TestDto, type: 'body', data: '' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should pass-through primitives', async () => {
    const result = await pipe.transform('hello', { metatype: String, type: 'query', data: 'q' });
    expect(result).toBe('hello');
  });
});

describe('ParseUUIDPipe', () => {
  let pipe: ParseUUIDPipe;

  beforeEach(() => {
    pipe = new ParseUUIDPipe();
  });

  it('should pass valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(pipe.transform(uuid)).toBe(uuid);
  });

  it('should throw BadRequestException for invalid UUID', () => {
    expect(() => pipe.transform('not-a-uuid')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });
});
