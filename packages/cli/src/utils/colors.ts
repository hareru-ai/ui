import pc from 'picocolors';

export const c = {
  success: pc.green,
  warning: pc.yellow,
  error: pc.red,
  info: pc.cyan,
  dim: pc.dim,
  bold: pc.bold,
  heading: (s: string) => pc.bold(pc.cyan(s)),
  code: pc.dim,
  path: pc.underline,
} as const;
