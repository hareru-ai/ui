import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../index.js';

describe('get-component-usage', () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterAll(async () => {
    await client?.close();
  });

  it('returns usage markdown for Button', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Button' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('# Button');
    expect(text).toContain('import { Button');
    expect(text).toContain('@hareru/ui');
    expect(text).toContain('## Variants');
  });

  it('is case-insensitive', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'button' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('# Button');
  });

  it('returns error for unknown component', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'NonExistent' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('not found');
    expect(text).toContain('Available components');
  });

  it('includes subcomponents in import for Card', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Card' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Card');
    expect(text).toContain('@hareru/ui');
  });

  it('outputs standalone and per-component CSS patterns', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Button' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('**Standalone:**');
    expect(text).toContain("@import '@hareru/ui/styles.css'");
    expect(text).toContain('**Per-component:**');
    expect(text).toContain("@import '@hareru/tokens/css'");
    expect(text).toContain("@import '@hareru/ui/styles/components/Button.css'");
  });

  it('includes animations.css for StreamingText per-component CSS', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'StreamingText' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("@import '@hareru/ui/styles/animations.css'");
    expect(text).toContain("@import '@hareru/ui/styles/components/StreamingText.css'");
  });

  it('includes animations.css for ToolCallCard per-component CSS', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'ToolCallCard' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("@import '@hareru/ui/styles/animations.css'");
  });
});

describe('validate-token-value', () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterAll(async () => {
    await client?.close();
  });

  it('validates correct OKLCH color', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'color', value: 'oklch(0.5 0.2 250)' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Valid');
  });

  it('rejects invalid color value', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'color', value: '#ff0000' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Invalid');
  });

  it('validates correct dimension value', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'dimension', value: '1.5rem' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Valid');
  });

  it('validates correct duration value', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'duration', value: '200ms' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Valid');
  });

  it('returns error for unknown token type', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'unknown', value: 'test' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Unknown token type');
    expect(text).toContain('Available types');
  });

  it('accepts any value for types without pattern', async () => {
    const result = await client.callTool({
      name: 'validate-token-value',
      arguments: { tokenType: 'fontFamily', value: 'Inter, sans-serif' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Valid');
  });
});
