import {
  Children,
  type ReactElement,
  type Ref,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> | undefined {
  const filteredRefs = refs.filter(Boolean) as Ref<T>[];
  if (filteredRefs.length === 0) return undefined;
  if (filteredRefs.length === 1) return filteredRefs[0];
  return (node: T | null) => {
    for (const ref of filteredRefs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...slotProps, ...childProps };
  for (const key of Object.keys(childProps)) {
    const slotVal = slotProps[key];
    const childVal = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotVal === 'function' && typeof childVal === 'function') {
      merged[key] = (...args: unknown[]) => {
        childVal(...args);
        slotVal(...args);
      };
    } else if (key === 'style' && typeof slotVal === 'object' && typeof childVal === 'object') {
      merged[key] = { ...(slotVal as object), ...(childVal as object) };
    } else if (key === 'className') {
      merged[key] = [slotVal, childVal].filter(Boolean).join(' ');
    }
  }
  return merged;
}

function getElementRef(element: ReactElement): Ref<unknown> | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(element.props, 'ref');
  if (descriptor?.get) {
    return descriptor.get();
  }
  return (element.props as Record<string, unknown>).ref as Ref<unknown> | undefined;
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    if (isValidElement(children)) {
      const childRef = getElementRef(children);
      const props = mergeProps(slotProps, children.props as Record<string, unknown>);
      props.ref = mergeRefs(forwardedRef, childRef);
      return cloneElement(children, props);
    }
    if (Children.count(children) > 1) {
      return Children.only(null);
    }
    return null;
  },
);
Slot.displayName = 'Slot';
