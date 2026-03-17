import { createRequire } from 'node:module';
import { Command } from 'commander';
import { registerAddCommand } from './commands/add.js';
import { registerInfoCommand } from './commands/info.js';
import { registerInitCommand } from './commands/init.js';
import { registerListCommand } from './commands/list.js';
import { registerUpdateCommand } from './commands/update.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

export function createProgram(): Command {
  const program = new Command();

  program
    .name('hareru')
    .description('Hareru UI CLI — add components, manage CSS imports')
    .version(version);

  registerListCommand(program);
  registerInfoCommand(program);
  registerAddCommand(program);
  registerInitCommand(program);
  registerUpdateCommand(program);

  return program;
}

export function run(argv: string[]): void {
  const program = createProgram();
  program.parse(argv);
}
