import { Toast as ToastPrimitive } from '@base-ui-components/react/toast';
import { cn } from '../../lib/cn';
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
} from './Toast';
import { toastManager } from './use-toast';

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <>
      {toasts.map((toastObj) => (
        <ToastPrimitive.Root
          key={toastObj.id}
          toast={toastObj}
          className={cn(
            toastVariants({ variant: toastObj.type === 'destructive' ? 'destructive' : 'default' }),
          )}
        >
          <div className="hui-toast__body">
            {toastObj.title && <ToastTitle>{toastObj.title}</ToastTitle>}
            {toastObj.description && <ToastDescription>{toastObj.description}</ToastDescription>}
          </div>
          <ToastClose />
        </ToastPrimitive.Root>
      ))}
      <ToastViewport />
    </>
  );
}

export function Toaster() {
  return (
    <ToastProvider toastManager={toastManager}>
      <ToastList />
    </ToastProvider>
  );
}
