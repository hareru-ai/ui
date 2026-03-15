import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@hareru/ui';

type ColorToken = { name: string; var: string };
type ColorGroup = { label: string; tokens: ColorToken[] };
type ShadowToken = { name: string; var: string };
type DurationToken = { name: string; var: string; value: string };
type FontFamily = { name: string; var: string };
type EasingToken = { name: string; var: string; value: string };
type ZIndexToken = { name: string; var: string; value: string };
type TrackingToken = { name: string; var: string };

/* ------------------------------------------------------------------ */
/*  Color Palette                                                     */
/* ------------------------------------------------------------------ */

const colorGroups: ColorGroup[] = [
  {
    label: 'Base',
    tokens: [
      { name: 'background', var: '--hui-color-background' },
      { name: 'foreground', var: '--hui-color-foreground' },
      { name: 'border', var: '--hui-color-border' },
      { name: 'ring', var: '--hui-color-ring' },
      { name: 'input', var: '--hui-color-input' },
      { name: 'overlay', var: '--hui-color-overlay' },
    ],
  },
  {
    label: 'Primary',
    tokens: [
      { name: 'primary', var: '--hui-color-primary' },
      { name: 'primary-foreground', var: '--hui-color-primary-foreground' },
      { name: 'primary-hover', var: '--hui-color-primary-hover' },
    ],
  },
  {
    label: 'Secondary',
    tokens: [
      { name: 'secondary', var: '--hui-color-secondary' },
      { name: 'secondary-foreground', var: '--hui-color-secondary-foreground' },
      { name: 'secondary-hover', var: '--hui-color-secondary-hover' },
    ],
  },
  {
    label: 'Destructive',
    tokens: [
      { name: 'destructive', var: '--hui-color-destructive' },
      { name: 'destructive-foreground', var: '--hui-color-destructive-foreground' },
      { name: 'destructive-hover', var: '--hui-color-destructive-hover' },
    ],
  },
  {
    label: 'Warning',
    tokens: [
      { name: 'warning', var: '--hui-color-warning' },
      { name: 'warning-foreground', var: '--hui-color-warning-foreground' },
      { name: 'warning-hover', var: '--hui-color-warning-hover' },
    ],
  },
  {
    label: 'Success',
    tokens: [
      { name: 'success', var: '--hui-color-success' },
      { name: 'success-foreground', var: '--hui-color-success-foreground' },
      { name: 'success-hover', var: '--hui-color-success-hover' },
    ],
  },
  {
    label: 'Info',
    tokens: [
      { name: 'info', var: '--hui-color-info' },
      { name: 'info-foreground', var: '--hui-color-info-foreground' },
      { name: 'info-hover', var: '--hui-color-info-hover' },
    ],
  },
  {
    label: 'Muted',
    tokens: [
      { name: 'muted', var: '--hui-color-muted' },
      { name: 'muted-foreground', var: '--hui-color-muted-foreground' },
    ],
  },
  {
    label: 'Accent',
    tokens: [
      { name: 'accent', var: '--hui-color-accent' },
      { name: 'accent-foreground', var: '--hui-color-accent-foreground' },
      { name: 'accent-hover', var: '--hui-color-accent-hover' },
    ],
  },
  {
    label: 'Chart',
    tokens: [
      { name: 'chart-1', var: '--hui-color-chart-1' },
      { name: 'chart-2', var: '--hui-color-chart-2' },
      { name: 'chart-3', var: '--hui-color-chart-3' },
      { name: 'chart-4', var: '--hui-color-chart-4' },
      { name: 'chart-5', var: '--hui-color-chart-5' },
    ],
  },
  {
    label: 'Card / Popover',
    tokens: [
      { name: 'card', var: '--hui-color-card' },
      { name: 'card-foreground', var: '--hui-color-card-foreground' },
      { name: 'popover', var: '--hui-color-popover' },
      { name: 'popover-foreground', var: '--hui-color-popover-foreground' },
    ],
  },
];

function ColorPalette() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palette</CardTitle>
        <CardDescription>Semantic color tokens — switch theme to see overrides</CardDescription>
      </CardHeader>
      <CardContent>
        {colorGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <Separator style={{ margin: 'var(--hui-spacing-4) 0' }} />}
            <p style={{ fontWeight: 600, marginBottom: 'var(--hui-spacing-2)' }}>{group.label}</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))',
                gap: 'var(--hui-spacing-3)',
              }}
            >
              {group.tokens.map((t) => (
                <div
                  key={t.var}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--hui-spacing-2)' }}
                >
                  <div
                    role="img"
                    aria-label={`${t.name} color swatch`}
                    style={{
                      width: 'var(--hui-spacing-8)',
                      height: 'var(--hui-spacing-8)',
                      borderRadius: 'var(--hui-radius-sm)',
                      backgroundColor: `var(${t.var})`,
                      border: '1px solid var(--hui-color-border)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--hui-font-size-xs)',
                      fontFamily: 'var(--hui-font-family-mono)',
                    }}
                  >
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Spacing Scale                                                     */
/* ------------------------------------------------------------------ */

type SpacingToken = { name: string; var: string };

const spacingTokens: SpacingToken[] = [
  { name: '0', var: '--hui-spacing-0' },
  { name: '1', var: '--hui-spacing-1' },
  { name: '2', var: '--hui-spacing-2' },
  { name: '3', var: '--hui-spacing-3' },
  { name: '4', var: '--hui-spacing-4' },
  { name: '5', var: '--hui-spacing-5' },
  { name: '6', var: '--hui-spacing-6' },
  { name: '8', var: '--hui-spacing-8' },
  { name: '10', var: '--hui-spacing-10' },
  { name: '12', var: '--hui-spacing-12' },
  { name: '16', var: '--hui-spacing-16' },
];

function SpacingScale() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spacing</CardTitle>
        <CardDescription>Spacing scale visualized as horizontal bars</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--hui-spacing-2)' }}>
          {spacingTokens.map((s) => (
            <div
              key={s.var}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--hui-spacing-3)' }}
            >
              <span
                style={{
                  width: 'var(--hui-spacing-10)',
                  textAlign: 'right',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  flexShrink: 0,
                }}
              >
                {s.name}
              </span>
              <div
                style={{
                  width: `var(${s.var})`,
                  height: '1rem',
                  backgroundColor: 'var(--hui-color-primary)',
                  borderRadius: 'var(--hui-radius-sm)',
                  minWidth: s.name === '0' ? '2px' : undefined,
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Border Radius                                                     */
/* ------------------------------------------------------------------ */

type RadiusToken = { name: string; var: string };

const radiusTokens: RadiusToken[] = [
  { name: 'none', var: '--hui-radius-none' },
  { name: 'sm', var: '--hui-radius-sm' },
  { name: 'md', var: '--hui-radius-md' },
  { name: 'lg', var: '--hui-radius-lg' },
  { name: 'xl', var: '--hui-radius-xl' },
  { name: 'full', var: '--hui-radius-full' },
];

function RadiusDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Border Radius</CardTitle>
        <CardDescription>Each radius token applied to a box</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--hui-spacing-4)',
            alignItems: 'end',
          }}
        >
          {radiusTokens.map((r) => (
            <div key={r.var} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 'var(--hui-spacing-12)',
                  height: 'var(--hui-spacing-12)',
                  backgroundColor: 'var(--hui-color-primary)',
                  borderRadius: `var(${r.var})`,
                }}
              />
              <span
                style={{
                  display: 'block',
                  marginTop: 'var(--hui-spacing-1)',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                }}
              >
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Typography                                                        */
/* ------------------------------------------------------------------ */

type FontToken = { name: string; var: string };

const fontSizes: FontToken[] = [
  { name: 'xs', var: '--hui-font-size-xs' },
  { name: 'sm', var: '--hui-font-size-sm' },
  { name: 'base', var: '--hui-font-size-base' },
  { name: 'lg', var: '--hui-font-size-lg' },
  { name: 'xl', var: '--hui-font-size-xl' },
  { name: '2xl', var: '--hui-font-size-2xl' },
  { name: '3xl', var: '--hui-font-size-3xl' },
  { name: '4xl', var: '--hui-font-size-4xl' },
  { name: '5xl', var: '--hui-font-size-5xl' },
  { name: '6xl', var: '--hui-font-size-6xl' },
];
const fontWeights: FontToken[] = [
  { name: 'normal', var: '--hui-font-weight-normal' },
  { name: 'medium', var: '--hui-font-weight-medium' },
  { name: 'semibold', var: '--hui-font-weight-semibold' },
  { name: 'bold', var: '--hui-font-weight-bold' },
];
const fontTrackings: TrackingToken[] = [
  { name: 'tighter', var: '--hui-font-tracking-tighter' },
  { name: 'tight', var: '--hui-font-tracking-tight' },
  { name: 'normal', var: '--hui-font-tracking-normal' },
  { name: 'wide', var: '--hui-font-tracking-wide' },
  { name: 'wider', var: '--hui-font-tracking-wider' },
  { name: 'widest', var: '--hui-font-tracking-widest' },
];
const fontFamilies: FontFamily[] = [
  { name: 'sans', var: '--hui-font-family-sans' },
  { name: 'mono', var: '--hui-font-family-mono' },
];

function TypographyDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography</CardTitle>
        <CardDescription>Font size, weight, and family tokens</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Font Size */}
        <p style={{ fontWeight: 600, marginBottom: 'var(--hui-spacing-2)' }}>Font Size</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--hui-spacing-1)' }}>
          {fontSizes.map((s) => (
            <div
              key={s.var}
              style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--hui-spacing-3)' }}
            >
              <span
                style={{
                  width: 'var(--hui-spacing-10)',
                  textAlign: 'right',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  flexShrink: 0,
                }}
              >
                {s.name}
              </span>
              <span style={{ fontSize: `var(${s.var})` }}>The quick brown fox</span>
            </div>
          ))}
        </div>

        <Separator style={{ margin: 'var(--hui-spacing-4) 0' }} />

        {/* Font Weight */}
        <p style={{ fontWeight: 600, marginBottom: 'var(--hui-spacing-2)' }}>Font Weight</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--hui-spacing-6)' }}>
          {fontWeights.map((w) => (
            <span key={w.var} style={{ fontWeight: `var(${w.var})` }}>
              {w.name}
            </span>
          ))}
        </div>

        <Separator style={{ margin: 'var(--hui-spacing-4) 0' }} />

        {/* Font Family */}
        <p style={{ fontWeight: 600, marginBottom: 'var(--hui-spacing-2)' }}>Font Family</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--hui-spacing-2)' }}>
          {fontFamilies.map((f) => (
            <div
              key={f.name}
              style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--hui-spacing-3)' }}
            >
              <span
                style={{
                  width: 'var(--hui-spacing-12)',
                  textAlign: 'right',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  flexShrink: 0,
                }}
              >
                {f.name}
              </span>
              <span style={{ fontFamily: `var(${f.var})` }}>ABCDEFGHIJ abcdefghij 0123456789</span>
            </div>
          ))}
        </div>

        <Separator style={{ margin: 'var(--hui-spacing-4) 0' }} />

        {/* Font Tracking */}
        <p style={{ fontWeight: 600, marginBottom: 'var(--hui-spacing-2)' }}>
          Letter Spacing (Tracking)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--hui-spacing-1)' }}>
          {fontTrackings.map((t) => (
            <div
              key={t.var}
              style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--hui-spacing-3)' }}
            >
              <span
                style={{
                  width: 'var(--hui-spacing-12)',
                  textAlign: 'right',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  flexShrink: 0,
                }}
              >
                {t.name}
              </span>
              <span style={{ letterSpacing: `var(${t.var})`, fontSize: 'var(--hui-font-size-lg)' }}>
                HARERU UI Design Tokens
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Typography Composite                                              */
/* ------------------------------------------------------------------ */

type TypographyCompositeToken = {
  name: string;
  label: string;
  className: string;
};

const typographyComposites: TypographyCompositeToken[] = [
  { name: 'h1', label: 'Heading 1', className: 'hui-typography-h1' },
  { name: 'h2', label: 'Heading 2', className: 'hui-typography-h2' },
  { name: 'h3', label: 'Heading 3', className: 'hui-typography-h3' },
  { name: 'h4', label: 'Heading 4', className: 'hui-typography-h4' },
  { name: 'body', label: 'Body', className: 'hui-typography-body' },
  { name: 'body-sm', label: 'Body Small', className: 'hui-typography-body-sm' },
  { name: 'caption', label: 'Caption', className: 'hui-typography-caption' },
];

function TypographyCompositeDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography Composite</CardTitle>
        <CardDescription>
          Composite typography tokens — font-size, weight, line-height, letter-spacing bundled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--hui-spacing-3)' }}>
          {typographyComposites.map((t) => (
            <div
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--hui-spacing-4)',
              }}
            >
              <span
                style={{
                  width: 'var(--hui-spacing-16)',
                  textAlign: 'right',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  color: 'var(--hui-color-muted-foreground)',
                  flexShrink: 0,
                }}
              >
                {t.name}
              </span>
              <span className={t.className}>{t.label} — The quick brown fox jumps</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Shadows                                                           */
/* ------------------------------------------------------------------ */

const shadowTokens: ShadowToken[] = [
  { name: 'sm', var: '--hui-shadow-sm' },
  { name: 'default', var: '--hui-shadow' },
  { name: 'md', var: '--hui-shadow-md' },
  { name: 'lg', var: '--hui-shadow-lg' },
  { name: 'xl', var: '--hui-shadow-xl' },
];

function ShadowDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shadows</CardTitle>
        <CardDescription>Shadow elevation tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--hui-spacing-6)' }}>
          {shadowTokens.map((s) => (
            <div key={s.name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  backgroundColor: 'var(--hui-color-card)',
                  borderRadius: 'var(--hui-radius-lg)',
                  boxShadow: `var(${s.var})`,
                }}
              />
              <span
                style={{
                  display: 'block',
                  marginTop: 'var(--hui-spacing-2)',
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Duration                                                          */
/* ------------------------------------------------------------------ */

const durationTokens: DurationToken[] = [
  { name: 'fast', var: '--hui-duration-fast', value: '100ms' },
  { name: 'normal', var: '--hui-duration-normal', value: '200ms' },
  { name: 'slow', var: '--hui-duration-slow', value: '300ms' },
  { name: 'slower', var: '--hui-duration-slower', value: '500ms' },
];

function DurationDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duration</CardTitle>
        <CardDescription>Transition / animation duration tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--hui-spacing-6)' }}>
          {durationTokens.map((d) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--hui-spacing-1)',
              }}
            >
              <span style={{ fontSize: 'var(--hui-font-size-lg)', fontWeight: 600 }}>
                {d.value}
              </span>
              <span
                style={{
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  color: 'var(--hui-color-muted-foreground)',
                }}
              >
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */

const easingTokens: EasingToken[] = [
  { name: 'linear', var: '--hui-easing-linear', value: 'cubic-bezier(0, 0, 1, 1)' },
  { name: 'in', var: '--hui-easing-in', value: 'cubic-bezier(0.42, 0, 1, 1)' },
  { name: 'out', var: '--hui-easing-out', value: 'cubic-bezier(0, 0, 0.58, 1)' },
  { name: 'in-out', var: '--hui-easing-in-out', value: 'cubic-bezier(0.42, 0, 0.58, 1)' },
];

function EasingDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Easing</CardTitle>
        <CardDescription>Transition timing function tokens — hover to preview</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
            gap: 'var(--hui-spacing-4)',
          }}
        >
          {easingTokens.map((e) => (
            <div
              key={e.name}
              className="hui-easing-preview-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--hui-spacing-2)',
                padding: 'var(--hui-spacing-3)',
                border: '1px solid var(--hui-color-border)',
                borderRadius: 'var(--hui-radius-md)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{e.name}</span>
              <span
                style={{
                  fontSize: 'var(--hui-font-size-xs)',
                  fontFamily: 'var(--hui-font-family-mono)',
                  color: 'var(--hui-color-muted-foreground)',
                }}
              >
                {e.value}
              </span>
              <div
                style={{
                  height: 'var(--hui-spacing-2)',
                  backgroundColor: 'var(--hui-color-muted)',
                  borderRadius: 'var(--hui-radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="hui-easing-preview"
                  style={{
                    width: 'var(--hui-spacing-6)',
                    height: '100%',
                    backgroundColor: 'var(--hui-color-primary)',
                    borderRadius: 'var(--hui-radius-full)',
                    transition: `margin-left var(--hui-duration-slow) var(${e.var})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  z-index                                                            */
/* ------------------------------------------------------------------ */

const zIndexTokens: ZIndexToken[] = [
  { name: 'base', var: '--hui-z-index-base', value: '10' },
  { name: 'dropdown', var: '--hui-z-index-dropdown', value: '50' },
  { name: 'sticky', var: '--hui-z-index-sticky', value: '500' },
  { name: 'modal', var: '--hui-z-index-modal', value: '1000' },
  { name: 'toast', var: '--hui-z-index-toast', value: '1100' },
];

function ZIndexDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>z-index</CardTitle>
        <CardDescription>Stacking order hierarchy tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            gap: 'var(--hui-spacing-3)',
            height: '10rem',
            paddingBottom: 'var(--hui-spacing-2)',
          }}
        >
          {zIndexTokens.map((z) => {
            const maxVal = 1100;
            const barRem = (Number.parseInt(z.value, 10) / maxVal) * 7;
            return (
              <div
                key={z.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 'var(--hui-spacing-1)',
                  flex: 1,
                  height: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--hui-font-size-xs)',
                    fontFamily: 'var(--hui-font-family-mono)',
                    fontWeight: 600,
                  }}
                >
                  {z.value}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(barRem, 0.5)}rem`,
                    backgroundColor: 'var(--hui-color-primary)',
                    borderRadius: 'var(--hui-radius-sm) var(--hui-radius-sm) 0 0',
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--hui-font-size-xs)',
                    fontFamily: 'var(--hui-font-family-mono)',
                    color: 'var(--hui-color-muted-foreground)',
                  }}
                >
                  {z.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export function TokensDemo() {
  return (
    <>
      <h2>Design Tokens</h2>
      <ColorPalette />
      <SpacingScale />
      <RadiusDemo />
      <TypographyDemo />
      <TypographyCompositeDemo />
      <ShadowDemo />
      <DurationDemo />
      <EasingDemo />
      <ZIndexDemo />
      <Separator style={{ margin: 'var(--hui-spacing-2) 0' }} />
      <h2>Components</h2>
    </>
  );
}
