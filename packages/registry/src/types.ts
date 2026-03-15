export interface TokensJSON {
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
}

export interface SchemaJSON {
  $schema: string;
  title: string;
  description: string;
  properties: {
    cssVariables: { items: { enum: string[] } };
    tokenPaths: { items: { enum: string[] } };
    typeConstraints: {
      properties: Record<string, { pattern?: string; type?: string; description?: string }>;
    };
    tokenCount: { const: number };
  };
}

export interface ComponentRegistryJSON {
  $schema: string;
  name: string;
  version: string;
  componentCount: number;
  components: ComponentEntry[];
  taskBundles?: TaskBundle[];
}

export interface TaskBundle {
  name: string;
  description: string;
  components: string[];
  cssArtifacts: string[];
  tokenCategories: TokenCategory[];
}

export type ComponentGroup =
  | 'core'
  | 'form'
  | 'layout'
  | 'overlay'
  | 'navigation'
  | 'feedback'
  | 'data-display'
  | 'agent'
  | 'di-domain';

export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'font'
  | 'typography'
  | 'shadow'
  | 'duration'
  | 'easing'
  | 'zIndex';

export interface ComponentEntry {
  name: string;
  displayName: string;
  group: ComponentGroup;
  cssArtifact: string;
  requiredCssArtifacts: string[];
  tokenCategories: TokenCategory[];
  subcomponents?: string[];
  variants?: VariantDef[];
  props?: PropDef[];
  componentSource: string;
  description: string;
  aiHint?: string;
  peerComponents?: string[];
}

export interface VariantDef {
  name: string;
  variants: Record<string, string[]>;
  defaultVariants: Record<string, string>;
}

export interface CustomPropDef {
  name: string;
  type: string;
  required: boolean;
}

export interface PropDef {
  name: string;
  extends: string | null;
  customProps?: CustomPropDef[];
}

export interface ComponentSchemaJSON {
  $schema: string;
  $id?: string;
  title?: string;
  required?: string[];
  properties: Record<string, unknown>;
  $defs?: Record<string, unknown>;
}

export type CssMode = 'standalone' | 'portable' | 'tailwind' | 'per-component';

export interface CssModeContext {
  /** Whether Tailwind CSS is detected in the project */
  hasTailwind: boolean;
  /** Number of Hareru components used in the project */
  componentCount: number;
  /** Whether the project already has a CSS reset or framework (e.g. Bootstrap, Pico) */
  hasExistingReset?: boolean;
}

export interface ConsumerRulesJSON {
  version: string;
  rules: Record<
    string,
    {
      description: string;
      rules: string[];
      examples: Record<string, string>;
    }
  >;
  tokenQuickReference: Record<string, string>;
}
