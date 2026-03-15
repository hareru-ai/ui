/** DTCG (W3C Design Token Community Group) standard token type */
export interface DTCGToken<T = string> {
  $type: TokenType;
  $value: T;
  $description?: string;
}

export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'number'
  | 'shadow'
  | 'typography'
  | 'cubicBezier';

/** Semantic color scale with foreground contrast */
export interface ColorScale {
  DEFAULT: string;
  foreground: string;
  hover?: string;
}

/** Typography composite token (DTCG typography type) */
export interface TypographyToken {
  fontFamily?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

/** Complete Hareru design token set */
export interface HareruTokens {
  color: {
    background: string;
    foreground: string;
    primary: ColorScale;
    secondary: ColorScale;
    destructive: ColorScale;
    warning: ColorScale;
    success: ColorScale;
    info: ColorScale;
    muted: ColorScale;
    accent: ColorScale;
    border: string;
    ring: string;
    card: { DEFAULT: string; foreground: string };
    popover: { DEFAULT: string; foreground: string };
    input: string;
    overlay: string;
    chart: Record<string, string>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  font: {
    family: { sans: string; mono: string };
    size: Record<string, string>;
    weight: Record<string, string>;
    leading: Record<string, string>;
    tracking: Record<string, string>;
  };
  typography: Record<string, TypographyToken>;
  shadow: Record<string, string>;
  duration: Record<string, string>;
  easing: Record<string, string>;
  zIndex: Record<string, string>;
}

/** Theme = light + dark token sets */
export interface HareruTheme {
  light: HareruTokens;
  dark: HareruTokens;
}
