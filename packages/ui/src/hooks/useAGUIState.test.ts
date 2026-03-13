import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type JsonPatchOp, applyPatch, useAGUIState } from './useAGUIState';

describe('applyPatch', () => {
  it('handles add operation', () => {
    const result = applyPatch({ a: 1 }, [{ op: 'add', path: '/b', value: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('handles replace operation', () => {
    const result = applyPatch({ a: 1 }, [{ op: 'replace', path: '/a', value: 42 }]);
    expect(result).toEqual({ a: 42 });
  });

  it('handles remove operation', () => {
    const result = applyPatch({ a: 1, b: 2 }, [{ op: 'remove', path: '/b' }]);
    expect(result).toEqual({ a: 1 });
  });

  it('handles move operation', () => {
    const result = applyPatch({ a: 1, b: 2 }, [{ op: 'move', from: '/a', path: '/c' }]);
    expect(result).toEqual({ b: 2, c: 1 });
  });

  it('handles copy operation', () => {
    const result = applyPatch({ a: { x: 1 } }, [{ op: 'copy', from: '/a', path: '/b' }]);
    expect(result).toEqual({ a: { x: 1 }, b: { x: 1 } });
  });

  it('throws on failed test operation', () => {
    expect(() => applyPatch({ a: 1 }, [{ op: 'test', path: '/a', value: 999 }])).toThrow(
      'Test failed',
    );
  });

  it('replaces array element by index (not insert)', () => {
    const result = applyPatch([1, 2, 3], [{ op: 'replace', path: '/1', value: 9 }]);
    expect(result).toEqual([1, 9, 3]);
  });

  it('throws on replace with out-of-bounds array index', () => {
    expect(() => applyPatch([1, 2], [{ op: 'replace', path: '/5', value: 9 }])).toThrow(
      'Index out of bounds',
    );
  });

  it('replaces root with path ""', () => {
    const result = applyPatch({ a: 1 }, [{ op: 'replace', path: '', value: { b: 2 } }]);
    expect(result).toEqual({ b: 2 });
  });

  it('copy creates a deep clone (independent reference)', () => {
    const original = { a: { nested: [1, 2] } };
    const result = applyPatch(original, [{ op: 'copy', from: '/a', path: '/b' }]);
    expect(result).toEqual({ a: { nested: [1, 2] }, b: { nested: [1, 2] } });
    // References should be independent
    (result as Record<string, { nested: number[] }>).b.nested.push(3);
    expect((result as Record<string, { nested: number[] }>).a.nested).toEqual([1, 2]);
  });

  it('add inserts into array at index', () => {
    const result = applyPatch([1, 3], [{ op: 'add', path: '/1', value: 2 }]);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('useAGUIState', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useAGUIState({ initialState: { count: 0 } }));
    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.snapshotVersion).toBe(0);
  });

  it('applySnapshot replaces state and increments snapshotVersion', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAGUIState({ initialState: { count: 0 }, onChange }));

    act(() => result.current.applySnapshot({ count: 100 }));

    expect(result.current.state).toEqual({ count: 100 });
    expect(result.current.snapshotVersion).toBe(1);
    expect(onChange).toHaveBeenCalledWith({ count: 100 }, { count: 0 });
  });

  it('applyDelta applies JSON Patch operations', () => {
    const { result } = renderHook(() =>
      useAGUIState({ initialState: { items: ['a', 'b'], meta: { v: 1 } } }),
    );

    act(() =>
      result.current.applyDelta([
        { op: 'replace', path: '/meta/v', value: 2 },
        { op: 'add', path: '/items/-', value: 'c' },
      ]),
    );

    expect(result.current.state).toEqual({ items: ['a', 'b', 'c'], meta: { v: 2 } });
  });

  it('applyDelta with nested operations', () => {
    const { result } = renderHook(() => useAGUIState({ initialState: { a: { b: { c: 1 } } } }));

    act(() => result.current.applyDelta([{ op: 'replace', path: '/a/b/c', value: 42 }]));

    expect(result.current.state).toEqual({ a: { b: { c: 42 } } });
  });

  it('validatePatch false rejects delta', () => {
    const validatePatch = vi.fn().mockReturnValue(false);
    const { result } = renderHook(() =>
      useAGUIState({
        initialState: { count: 0 },
        validatePatch,
      }),
    );

    act(() => result.current.applyDelta([{ op: 'replace', path: '/count', value: 999 }]));

    expect(result.current.state).toEqual({ count: 0 });
    expect(validatePatch).toHaveBeenCalled();
  });

  it('test operation failure throws and state remains unchanged', () => {
    const { result } = renderHook(() => useAGUIState({ initialState: { v: 1 } }));

    expect(() => {
      act(() =>
        result.current.applyDelta([{ op: 'test', path: '/v', value: 999 }] as JsonPatchOp[]),
      );
    }).toThrow('Test failed');
    // State should remain unchanged after throw
    expect(result.current.state).toEqual({ v: 1 });
  });

  it('reset restores initial state', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAGUIState({ initialState: { count: 0 }, onChange }));

    act(() => result.current.applySnapshot({ count: 50 }));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.snapshotVersion).toBe(0);
  });

  it('applySnapshot calls onChange callback', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAGUIState({ initialState: { x: 0 }, onChange }));

    act(() => result.current.applySnapshot({ x: 10 }));
    expect(onChange).toHaveBeenCalledWith({ x: 10 }, { x: 0 });
  });

  it('applyDelta calls onChange callback', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAGUIState({ initialState: { x: 0 }, onChange }));

    act(() => result.current.applyDelta([{ op: 'replace', path: '/x', value: 5 }]));

    expect(onChange).toHaveBeenCalledWith({ x: 5 }, { x: 0 });
  });

  it('onError catches applyDelta failure without throwing', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAGUIState({ initialState: { v: 1 }, onError }));

    const ops: JsonPatchOp[] = [{ op: 'test', path: '/v', value: 999 }];
    act(() => result.current.applyDelta(ops));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][1]).toBe(ops);
    // State should remain unchanged
    expect(result.current.state).toEqual({ v: 1 });
  });

  it('applyDelta throws when onError is not provided', () => {
    const { result } = renderHook(() => useAGUIState({ initialState: { v: 1 } }));

    expect(() => {
      act(() => result.current.applyDelta([{ op: 'test', path: '/v', value: 999 }]));
    }).toThrow('Test failed');
  });
});
