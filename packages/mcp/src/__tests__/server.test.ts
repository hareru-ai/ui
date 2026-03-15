import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../index.js';

describe('MCP Server integration', () => {
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

  describe('resources', () => {
    it('lists 6 resources', async () => {
      const result = await client.listResources();
      expect(result.resources).toHaveLength(6);
      const uris = result.resources.map((r) => r.uri);
      expect(uris).toContain('hareru-ui://tokens');
      expect(uris).toContain('hareru-ui://tokens/schema');
      expect(uris).toContain('hareru-ui://components');
      expect(uris).toContain('hareru-ui://components/schema');
      expect(uris).toContain('hareru-ui://bundles');
      expect(uris).toContain('hareru-ui://rules/consumer');
    });

    it('reads hareru-ui://tokens with light and dark themes', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://tokens' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data).toHaveProperty('light');
      expect(data).toHaveProperty('dark');
      expect(data.light).toHaveProperty('color');
    });

    it('reads hareru-ui://tokens/schema with cssVariables', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://tokens/schema' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data.properties.cssVariables.items.enum).toContain('--hui-color-primary');
      expect(data.properties.tokenCount.const).toBeGreaterThan(0);
    });

    it('reads hareru-ui://components with component list', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data.componentCount).toBeGreaterThan(0);
      expect(data.components.length).toBe(data.componentCount);

      const button = data.components.find((c: { name: string }) => c.name === 'Button');
      expect(button).toBeDefined();
    });

    it('reads hareru-ui://bundles with task bundles', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://bundles' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data).toHaveLength(5);
      const names = data.map((b: { name: string }) => b.name);
      expect(names).toContain('agent-chat-shell');
      expect(names).toContain('form-basics');
      for (const bundle of data) {
        expect(bundle.cssArtifacts.length).toBeGreaterThan(0);
        expect(bundle.tokenCategories.length).toBeGreaterThan(0);
      }
    });

    it('reads hareru-ui://components/schema with JSON Schema', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components/schema' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data.$schema).toContain('json-schema.org');
      expect(data.properties).toBeDefined();
      expect(data.properties.components).toBeDefined();
    });

    it('reads hareru-ui://rules/consumer with version and rules', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://rules/consumer' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('rules');
      expect(data).toHaveProperty('tokenQuickReference');
      expect(data.rules).toHaveProperty('imports');
      expect(data.rules).toHaveProperty('styling');
      expect(data.rules).toHaveProperty('theming');
    });
  });

  describe('tools', () => {
    it('lists 5 tools', async () => {
      const result = await client.listTools();
      expect(result.tools).toHaveLength(5);
      const names = result.tools.map((t) => t.name);
      expect(names).toContain('get-component-usage');
      expect(names).toContain('get-bundle-usage');
      expect(names).toContain('validate-token-value');
      expect(names).toContain('recommend-css-mode');
      expect(names).toContain('list-components-by-group');
    });

    it('get-component-usage returns markdown for Button', async () => {
      const result = await client.callTool({
        name: 'get-component-usage',
        arguments: { componentName: 'Button' },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain('# Button');
      expect(text).toContain('variant');
      expect(text).toContain('size');
    });

    it('validate-token-value validates OKLCH color', async () => {
      const result = await client.callTool({
        name: 'validate-token-value',
        arguments: { tokenType: 'color', value: 'oklch(0.5 0.2 250)' },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain('Valid');
    });
  });

  describe('prompts', () => {
    it('lists 3 prompts', async () => {
      const result = await client.listPrompts();
      expect(result.prompts).toHaveLength(3);
      const names = result.prompts.map((p) => p.name);
      expect(names).toContain('create-ui');
      expect(names).toContain('create-ui-tailwind');
      expect(names).toContain('consumer-rules');
    });

    it('returns create-ui prompt with component descriptions and bundles', async () => {
      const result = await client.getPrompt({
        name: 'create-ui',
        arguments: { description: 'A login form' },
      });
      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Hareru UI');
      expect(text).toContain('Button');
      expect(text).toContain('A login form');
      expect(text).toContain('--hui-');
      // Phase 3A: descriptions in component list
      expect(text).toContain(' — ');
      // Phase 3B: bundles section
      expect(text).toContain('Available Bundles');
      expect(text).toContain('agent-chat-shell');
    });

    it('create-ui prompt includes variant info and does not contain variant="primary"', async () => {
      const result = await client.getPrompt({
        name: 'create-ui',
        arguments: { description: 'test' },
      });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('variant(');
      expect(text).not.toContain('variant="primary"');
    });

    it('returns create-ui-tailwind prompt with layer guidance', async () => {
      const result = await client.getPrompt({
        name: 'create-ui-tailwind',
        arguments: { description: 'A dashboard' },
      });
      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Tailwind CSS v4');
      expect(text).toContain('@layer');
      expect(text).toContain('components.layer.css');
      expect(text).toContain('A dashboard');
      expect(text).toContain('Button');
    });

    it('returns consumer-rules prompt with import and styling rules', async () => {
      const result = await client.getPrompt({ name: 'consumer-rules', arguments: {} });
      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('Hareru UI Consumer Rules');
      expect(text).toContain('imports');
      expect(text).toContain('styling');
      expect(text).toContain('Token Quick Reference');
      expect(text).toContain('--hui-');
    });

    it('consumer-rules prompt formats cssImports examples as code fences', async () => {
      const result = await client.getPrompt({ name: 'consumer-rules', arguments: {} });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('```css');
      expect(text).toContain("@import '@hareru/ui/styles.css'");
    });
  });

  describe('registry metadata', () => {
    it('every component has a group field', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      for (const comp of data.components) {
        expect(comp.group, `${comp.name} should have group`).toBeTruthy();
      }
    });

    it('every component has componentSource and description', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      for (const comp of data.components) {
        expect(comp.componentSource, `${comp.name} should have componentSource`).toBeTruthy();
        expect(comp.description, `${comp.name} should have description`).toBeTruthy();
      }
    });

    it('Button has peerComponents array', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      const button = data.components.find((c: { name: string }) => c.name === 'Button');
      expect(button.peerComponents).toBeDefined();
      expect(Array.isArray(button.peerComponents)).toBe(true);
      expect(button.peerComponents.length).toBeGreaterThan(0);
    });

    // Button has no shared keyframe dependencies — verify it stays clean
    it('Button has correct cssArtifact and empty requiredCssArtifacts', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      const button = data.components.find((c: { name: string }) => c.name === 'Button');
      expect(button.cssArtifact).toBe('styles/components/Button.css');
      expect(button.requiredCssArtifacts).toEqual([]);
    });

    it('StreamingText requires animations.css', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      const st = data.components.find((c: { name: string }) => c.name === 'StreamingText');
      expect(st.requiredCssArtifacts).toContain('styles/animations.css');
    });

    it('every component has tokenCategories array', async () => {
      const result = await client.readResource({ uri: 'hareru-ui://components' });
      const text = (result.contents[0] as { text: string }).text;
      const data = JSON.parse(text);
      for (const comp of data.components) {
        expect(Array.isArray(comp.tokenCategories), `${comp.name} tokenCategories is array`).toBe(
          true,
        );
      }
    });
  });
});
