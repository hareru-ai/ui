export const BENTO_PRESETS = {
  default: {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 } as Record<string, number>,
    cols: { lg: 12, md: 8, sm: 4, xs: 2 } as Record<string, number>,
  },
  profile: {
    breakpoints: { lg: 1200, md: 768, sm: 480 } as Record<string, number>,
    cols: { lg: 6, md: 4, sm: 2 } as Record<string, number>,
  },
};

export type BentoPresetName = keyof typeof BENTO_PRESETS;
