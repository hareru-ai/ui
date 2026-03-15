import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TokenGenerator } from '../dist/index.js';
import { defaultTheme } from '../dist/presets/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

// Generate theme CSS
const css = TokenGenerator.generateThemeCSS(defaultTheme);
writeFileSync(join(DIST_DIR, 'theme.css'), css, 'utf-8');
console.log('Generated dist/theme.css');

// Generate DTCG tokens JSON (light + dark)
const tokensJson = {
  light: TokenGenerator.toDTCG(defaultTheme.light),
  dark: TokenGenerator.toDTCG(defaultTheme.dark),
};
writeFileSync(join(DIST_DIR, 'tokens.json'), JSON.stringify(tokensJson, null, 2), 'utf-8');
console.log('Generated dist/tokens.json');

// Generate JSON Schema from DTCG tokens
const schema = TokenGenerator.toJSONSchema(defaultTheme);
writeFileSync(join(DIST_DIR, 'tokens.schema.json'), JSON.stringify(schema, null, 2), 'utf-8');
console.log('Generated dist/tokens.schema.json');
