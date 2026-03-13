import { type HTMLAttributes, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '../Combobox';

export interface AsyncComboboxItem {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface AsyncComboboxFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  placeholder?: string;
  fetchUrl: string;
  queryParam?: string;
  value?: string;
  onValueChange?: (value: string, item?: AsyncComboboxItem) => void;
  debounceMs?: number;
  mapResponse?: (data: unknown) => AsyncComboboxItem[];
  required?: boolean;
  error?: string;
}

export const AsyncComboboxField = forwardRef<HTMLDivElement, AsyncComboboxFieldProps>(
  (
    {
      className,
      label,
      placeholder = '検索...',
      fetchUrl,
      queryParam = 'q',
      value,
      onValueChange,
      debounceMs = 300,
      mapResponse,
      required,
      error,
      ...props
    },
    ref,
  ) => {
    const [items, setItems] = useState<AsyncComboboxItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const fetchItems = useCallback(
      async (q: string) => {
        setLoading(true);
        try {
          const url = new URL(fetchUrl, window.location.origin);
          url.searchParams.set(queryParam, q);
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            const mapped = mapResponse
              ? mapResponse(data)
              : (data.accounts ?? data.items ?? data) as AsyncComboboxItem[];
            setItems(mapped);
          }
        } catch {
          // Silently handle fetch errors
        } finally {
          setLoading(false);
        }
      },
      [fetchUrl, queryParam, mapResponse],
    );

    useEffect(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fetchItems(query);
      }, debounceMs);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [query, debounceMs, fetchItems]);

    const handleSelect = (selectedValue: string) => {
      const item = items.find((i) => i.value === selectedValue);
      onValueChange?.(selectedValue, item);
    };

    return (
      <div ref={ref} className={cn('hui-async-combobox-field', className)} {...props}>
        <span className="hui-async-combobox-field__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
        <Combobox>
          <ComboboxTrigger>
            {value
              ? items.find((i) => i.value === value)?.label ?? value
              : placeholder}
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />
            <ComboboxList>
              {loading ? (
                <div className="hui-async-combobox-field__loading">読み込み中...</div>
              ) : items.length === 0 ? (
                <ComboboxEmpty>候補が見つかりません</ComboboxEmpty>
              ) : (
                items.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => handleSelect(item.value)}
                  >
                    {item.label}
                  </ComboboxItem>
                ))
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {error && <span className="hui-async-combobox-field__error">{error}</span>}
      </div>
    );
  },
);
AsyncComboboxField.displayName = 'AsyncComboboxField';
