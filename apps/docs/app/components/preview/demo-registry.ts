import { type ComponentType, lazy } from 'react';

export const demos: Record<string, ComponentType> = {
  'button-variants': lazy(() => import('./demos/button-variants')),
  'card-demo': lazy(() => import('./demos/card-demo')),
  'dialog-demo': lazy(() => import('./demos/dialog-demo')),
  'input-demo': lazy(() => import('./demos/input-demo')),
  'badge-demo': lazy(() => import('./demos/badge-demo')),
  'tabs-demo': lazy(() => import('./demos/tabs-demo')),
};
