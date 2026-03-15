import {
  type HTMLAttributes,
  type ImgHTMLAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../lib/cn';

type ImageStatus = 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  status: ImageStatus;
  onStatusChange: (status: ImageStatus) => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  status: 'loading',
  onStatusChange: () => {},
});

// --- Avatar (root) ---
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(({ className, ...props }, ref) => {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const contextValue = useMemo(() => ({ status, onStatusChange: setStatus }), [status]);

  return (
    <AvatarContext.Provider value={contextValue}>
      <span ref={ref} className={cn('hui-avatar', className)} {...props} />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = 'Avatar';

// --- AvatarImage ---
export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onLoad, onError, ...props }, ref) => {
    const { status, onStatusChange } = useContext(AvatarContext);

    const handleLoad = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        onStatusChange('loaded');
        onLoad?.(e);
      },
      [onStatusChange, onLoad],
    );

    const handleError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        onStatusChange('error');
        onError?.(e);
      },
      [onStatusChange, onError],
    );

    useEffect(() => {
      if (!src) {
        onStatusChange('error');
      }
    }, [src, onStatusChange]);

    if (status === 'error') return null;

    return (
      <img
        ref={ref}
        className={cn('hui-avatar__image', className)}
        src={src}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
        alt={alt || ''}
      />
    );
  },
);
AvatarImage.displayName = 'AvatarImage';

// --- AvatarFallback ---
export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {}

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    const { status } = useContext(AvatarContext);

    if (status === 'loaded') return null;

    return <span ref={ref} className={cn('hui-avatar__fallback', className)} {...props} />;
  },
);
AvatarFallback.displayName = 'AvatarFallback';
