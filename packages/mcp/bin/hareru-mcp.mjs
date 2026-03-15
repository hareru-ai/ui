#!/usr/bin/env node
import { startServer } from '../dist/index.js';

startServer().catch((error) => {
  console.error('Failed to start Hareru UI MCP server:', error);
  process.exit(1);
});
