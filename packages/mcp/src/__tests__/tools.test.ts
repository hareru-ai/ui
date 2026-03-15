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

  it('includes description in output', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Button' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    // Description appears right after # Button heading
    const lines = text.split('\n');
    const headingIndex = lines.findIndex((l) => l.startsWith('# Button'));
    expect(headingIndex).toBeGreaterThanOrEqual(0);
    // Non-empty content after heading
    const descLine = lines[headingIndex + 2]; // skip blank line
    expect(descLine.length).toBeGreaterThan(0);
  });

  it('includes peerComponents as Also Consider section', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Button' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('## Also Consider');
    expect(text).toContain('- Input');
    expect(text).toContain('- Label');
  });

  it('omits AI Guidance section when component has no aiHint', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Separator' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).not.toContain('## AI Guidance');
  });

  it('omits Also Consider section when component has no peerComponents', async () => {
    const result = await client.callTool({
      name: 'get-component-usage',
      arguments: { componentName: 'Separator' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).not.toContain('## Also Consider');
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

describe('get-bundle-usage', () => {
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

  it('returns usage markdown for agent-chat-shell', async () => {
    const result = await client.callTool({
      name: 'get-bundle-usage',
      arguments: { bundleName: 'agent-chat-shell' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('# Bundle: agent-chat-shell');
    expect(text).toContain('ChatContainer');
    expect(text).toContain('ChatMessage');
    expect(text).toContain('## Import');
    expect(text).toContain('## CSS');
    expect(text).toContain('## Token Categories');
    expect(text).toContain('## Components');
  });

  it('returns error for unknown bundle', async () => {
    const result = await client.callTool({
      name: 'get-bundle-usage',
      arguments: { bundleName: 'nonexistent' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('not found');
    expect(text).toContain('Available bundles');
  });

  it('includes component descriptions in output', async () => {
    const result = await client.callTool({
      name: 'get-bundle-usage',
      arguments: { bundleName: 'form-basics' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    // Each component listed should have a description after —
    expect(text).toContain('**Button** —');
    expect(text).toContain('**Input** —');
  });
});

describe('recommend-css-mode', () => {
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

  it('recommends tailwind mode when hasTailwind is true', async () => {
    const result = await client.callTool({
      name: 'recommend-css-mode',
      arguments: { hasTailwind: true, componentCount: 5 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('tailwind');
    expect(text).toContain('recommended');
  });

  it('recommends standalone mode for many components without tailwind', async () => {
    const result = await client.callTool({
      name: 'recommend-css-mode',
      arguments: { hasTailwind: false, componentCount: 10 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('standalone');
    expect(text).toContain('recommended');
  });

  it('recommends per-component for few components', async () => {
    const result = await client.callTool({
      name: 'recommend-css-mode',
      arguments: { hasTailwind: false, componentCount: 2 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('per-component');
    expect(text).toContain('recommended');
  });

  it('recommends portable when hasExistingReset is true', async () => {
    const result = await client.callTool({
      name: 'recommend-css-mode',
      arguments: { hasTailwind: false, componentCount: 10, hasExistingReset: true },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('portable');
    expect(text).toContain('recommended');
  });

  it('lists all 4 modes in output', async () => {
    const result = await client.callTool({
      name: 'recommend-css-mode',
      arguments: { hasTailwind: false, componentCount: 5 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('standalone');
    expect(text).toContain('portable');
    expect(text).toContain('tailwind');
    expect(text).toContain('per-component');
  });
});

describe('list-components-by-group', () => {
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

  it('returns components for the "core" group', async () => {
    const result = await client.callTool({
      name: 'list-components-by-group',
      arguments: { group: 'core' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('core');
    expect(text).toContain('Button');
  });

  it('returns components for the "form" group', async () => {
    const result = await client.callTool({
      name: 'list-components-by-group',
      arguments: { group: 'form' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('form');
    expect(text).toContain('FormField');
  });

  it('returns components for the "agent" group', async () => {
    const result = await client.callTool({
      name: 'list-components-by-group',
      arguments: { group: 'agent' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('agent');
  });

  it('returns components for the "di-domain" group', async () => {
    const result = await client.callTool({
      name: 'list-components-by-group',
      arguments: { group: 'di-domain' },
    });
    // di-domain may be empty if no components are assigned
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toBeTruthy();
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
