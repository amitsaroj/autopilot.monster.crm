jest.mock('dns/promises', () => ({ lookup: jest.fn() }));
jest.mock('axios', () => ({ __esModule: true, default: { request: jest.fn() } }));

import axios from 'axios';
import { lookup } from 'dns/promises';

import {
  WorkflowActionExecutorService,
  safeWebhookHeaders,
} from './workflow-action-executor.service';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';

type Ctor = new (...args: unknown[]) => WorkflowActionExecutorService;

describe('CALL_WEBHOOK SSRF hardening', () => {
  const request = axios.request as jest.Mock;
  const resolve = lookup as unknown as jest.Mock;
  const policy = { assertAction: jest.fn() } as unknown as WorkflowRuntimePolicyService;
  // Only the policy dependency is touched by CALL_WEBHOOK.
  const deps: unknown[] = Array.from({ length: 12 }, () => ({}));
  const service = new (WorkflowActionExecutorService as unknown as Ctor)(...deps, policy);
  const context = { tenantId: 'tenant-1', eventName: 'MANUAL', payload: {} };
  const run = (url: string, payload: Record<string, unknown> = {}) =>
    service.executeAction(
      { id: 'hook', type: 'CALL_WEBHOOK', config: { url } },
      { ...context, payload },
    );

  beforeEach(() => {
    jest.clearAllMocks();
    resolve.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  });

  it.each(['http://10.0.0.5/hook', 'http://169.254.169.254/latest/meta-data', 'http://127.0.0.1/'])(
    'rejects private destination %s without sending',
    async (url) => {
      await expect(run(url)).rejects.toThrow(/Private webhook destination/);
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('rejects a public hostname that resolves to a private address', async () => {
    resolve.mockResolvedValue([{ address: '192.168.1.10', family: 4 }]);
    await expect(run('https://rebind.example.com/hook')).rejects.toThrow(/private or reserved/);
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects a templated URL that renders to a private host', async () => {
    await expect(
      service.executeAction(
        { id: 'hook', type: 'CALL_WEBHOOK', config: { url: '{{target}}' } },
        { ...context, payload: { target: 'http://169.254.169.254/latest' } },
      ),
    ).rejects.toThrow(/Private webhook destination/);
    expect(request).not.toHaveBeenCalled();
  });

  it('does not follow a redirect (e.g. to a private host) and fails the step', async () => {
    request.mockResolvedValue({ status: 302, headers: { location: 'http://10.0.0.1/' } });
    await expect(run('https://hooks.example.com/x')).rejects.toThrow(/redirects are not followed/);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ maxRedirects: 0, proxy: false }),
    );
  });

  it('sends to a public URL through pinned agents', async () => {
    request.mockResolvedValue({ status: 200 });
    const result = await run('https://hooks.example.com/x');
    expect(result).toMatchObject({ status: 'COMPLETED', httpStatus: 200 });
    const options = request.mock.calls[0][0] as Record<string, unknown>;
    expect(options.httpsAgent).toBeDefined();
    expect(options.httpAgent).toBeDefined();
  });

  it('strips unsafe headers', () => {
    expect(
      safeWebhookHeaders({
        Host: 'internal',
        'X-Forwarded-For': '10.0.0.1',
        Authorization: 'Bearer t',
        'X-Custom': 'ok',
        'X-Bad': 'a\r\nInjected: 1',
        Connection: 'keep-alive',
      }),
    ).toEqual({ Authorization: 'Bearer t', 'X-Custom': 'ok' });
  });
});
