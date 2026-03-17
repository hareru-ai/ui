import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BROKEN_UTILS_MOCK = {
  loadTokens: () => {
    throw new Error('tokens missing');
  },
  loadSchema: () => {
    throw new Error('schema missing');
  },
  loadRegistry: () => {
    throw new Error('registry missing');
  },
  loadComponentSchema: () => {
    throw new Error('schema missing');
  },
  loadConsumerRules: () => {
    throw new Error('rules missing');
  },
  CSS_MODES: ['standalone', 'portable', 'per-component', 'tailwind'],
  CSS_MODE_DESCRIPTIONS: {
    standalone: '',
    portable: '',
    'per-component': '',
    tailwind: '',
  },
  recommendCssMode: () => ({ mode: 'standalone', reason: 'test' }),
  buildSlotTree: () => null,
};

async function createBrokenClient(): Promise<Client> {
  const { createServer } = await import('../index.js');
  const { Client: ClientClass } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { InMemoryTransport } = await import('@modelcontextprotocol/sdk/inMemory.js');

  const server = createServer();
  const client = new ClientClass({ name: 'test', version: '1.0.0' });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(ct), server.connect(st)]);
  return client;
}

describe('MCP error resilience', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('../utils.js', () => BROKEN_UTILS_MOCK);
  });
  afterEach(() => {
    vi.doUnmock('../utils.js');
    vi.restoreAllMocks();
  });

  it('createServer does not throw when artifacts fail to load', async () => {
    const { createServer } = await import('../index.js');
    expect(() => createServer()).not.toThrow();
  });

  it('get-component-usage returns isError when registry unavailable', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.callTool({
        name: 'get-component-usage',
        arguments: { componentName: 'Button' },
      });
      expect(result.isError).toBe(true);
      expect((result.content as Array<{ text: string }>)[0].text).toContain('registry missing');
    } finally {
      await client.close();
    }
  });

  it('get-bundle-usage returns isError when registry unavailable', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.callTool({
        name: 'get-bundle-usage',
        arguments: { bundleName: 'agent-chat-shell' },
      });
      expect(result.isError).toBe(true);
      expect((result.content as Array<{ text: string }>)[0].text).toContain('registry missing');
    } finally {
      await client.close();
    }
  });

  it('list-components-by-group returns isError when registry unavailable', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.callTool({
        name: 'list-components-by-group',
        arguments: { group: 'core' },
      });
      expect(result.isError).toBe(true);
      expect((result.content as Array<{ text: string }>)[0].text).toContain('registry missing');
    } finally {
      await client.close();
    }
  });

  it('validate-token-value returns isError when schema unavailable', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.callTool({
        name: 'validate-token-value',
        arguments: { tokenType: 'color', value: 'oklch(0.5 0.2 250)' },
      });
      expect(result.isError).toBe(true);
      expect((result.content as Array<{ text: string }>)[0].text).toContain('schema missing');
    } finally {
      await client.close();
    }
  });

  it('resource returns JSON error object when load fails', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.readResource({ uri: 'hareru-ui://tokens' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('tokens missing');
    } finally {
      await client.close();
    }
  });

  it('create-ui prompt returns error message when load fails', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.getPrompt({
        name: 'create-ui',
        arguments: { description: 'test' },
      });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Error:');
      expect(text).toContain('registry missing');
    } finally {
      await client.close();
    }
  });

  it('create-ui-tailwind prompt returns error message when load fails', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.getPrompt({
        name: 'create-ui-tailwind',
        arguments: { description: 'test' },
      });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Error:');
      expect(text).toContain('registry missing');
    } finally {
      await client.close();
    }
  });

  it('consumer-rules prompt returns error message when load fails', async () => {
    const client = await createBrokenClient();
    try {
      const result = await client.getPrompt({
        name: 'consumer-rules',
        arguments: {},
      });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Error:');
      expect(text).toContain('rules missing');
    } finally {
      await client.close();
    }
  });
});
