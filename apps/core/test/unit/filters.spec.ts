import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

function makeArgHost(statusCodeSetter: jest.Mock, _jsonSetter: jest.Mock, headers: Record<string, string> = {}): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: statusCodeSetter,
      }),
      getRequest: () => ({
        headers,
      }),
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  });

  it('should return standardised envelope for 404', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
    const host = makeArgHost(statusMock, jsonMock);
    filter.catch(exception, host);
    expect(statusMock).toHaveBeenCalledWith(404);
    const body = jsonMock.mock.calls[0][0] as Record<string, unknown>;
    expect(body['success']).toBe(false);
    expect(body['code']).toBe('VAL_002');
  });

  it('should return standardised envelope for 401', () => {
    const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const host = makeArgHost(statusMock, jsonMock);
    filter.catch(exception, host);
    const body = jsonMock.mock.calls[0][0] as Record<string, unknown>;
    expect(body['code']).toBe('AUTH_001');
  });

  it('should propagate correlationId from header', () => {
    const exception = new HttpException('error', HttpStatus.BAD_REQUEST);
    const host = makeArgHost(statusMock, jsonMock, { 'x-correlation-id': 'test-123' });
    filter.catch(exception, host);
    const body = jsonMock.mock.calls[0][0] as Record<string, unknown>;
    expect(body['correlationId']).toBe('test-123');
  });
});

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  });

  it('should return 500 for unexpected errors', () => {
    const host = makeArgHost(statusMock, jsonMock);
    filter.catch(new Error('boom'), host);
    expect(statusMock).toHaveBeenCalledWith(500);
    const body = jsonMock.mock.calls[0][0] as Record<string, unknown>;
    expect(body['success']).toBe(false);
    expect(body['code']).toBe('SRV_001');
  });
});
