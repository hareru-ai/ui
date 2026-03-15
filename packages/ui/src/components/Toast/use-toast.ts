import { Toast as ToastPrimitive } from '@base-ui-components/react/toast';
import type { ToastActionElement } from './Toast';

export type ToasterToast = {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
};

const toastManager = ToastPrimitive.createToastManager();

export function toast(options: Omit<ToasterToast, 'id'>) {
  const id = toastManager.add({
    title: options.title,
    description: options.description,
    type: options.variant ?? 'default',
  });

  const dismiss = () => toastManager.close(id);

  return {
    id,
    dismiss,
    update: (props: Omit<ToasterToast, 'id'>) =>
      toastManager.update(id, {
        title: props.title,
        description: props.description,
        type: props.variant ?? 'default',
      }),
  };
}

export { toastManager };

export function useToast() {
  return { toast };
}
