import { useCallback, useRef, useState } from 'react';

// --- JSON Patch (RFC 6902) minimal implementation ---

export interface JsonPatchOp {
  op: 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

function parsePath(path: string): string[] {
  if (path === '') return [];
  if (!path.startsWith('/')) throw new Error(`Invalid JSON Pointer: ${path}`);
  return path
    .slice(1)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function getByPath(obj: unknown, tokens: string[]): unknown {
  let current = obj;
  for (const token of tokens) {
    if (current == null || typeof current !== 'object') {
      throw new Error(`Path not found: ${tokens.join('/')}`);
    }
    current = (current as Record<string, unknown>)[token];
  }
  return current;
}

function setByPath(obj: unknown, tokens: string[], value: unknown): void {
  if (tokens.length === 0) throw new Error('Cannot set root via path');
  let current = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (current == null || typeof current !== 'object') {
      throw new Error(`Path not found: ${tokens.slice(0, i + 1).join('/')}`);
    }
    current = (current as Record<string, unknown>)[token];
  }
  if (current == null || typeof current !== 'object') {
    throw new Error('Cannot set on non-object');
  }
  const lastToken = tokens[tokens.length - 1];
  if (Array.isArray(current)) {
    if (lastToken === '-') {
      current.push(value);
    } else {
      const idx = Number(lastToken);
      current.splice(idx, 0, value);
    }
  } else {
    (current as Record<string, unknown>)[lastToken] = value;
  }
}

function removeByPath(obj: unknown, tokens: string[]): void {
  if (tokens.length === 0) throw new Error('Cannot remove root');
  let current = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (current == null || typeof current !== 'object') {
      throw new Error('Path not found');
    }
    current = (current as Record<string, unknown>)[token];
  }
  if (current == null || typeof current !== 'object') {
    throw new Error('Cannot remove from non-object');
  }
  const lastToken = tokens[tokens.length - 1];
  if (Array.isArray(current)) {
    const idx = Number(lastToken);
    if (Number.isNaN(idx) || idx < 0 || idx >= current.length) {
      throw new Error(`Index out of bounds: ${lastToken}`);
    }
    current.splice(idx, 1);
  } else {
    delete (current as Record<string, unknown>)[lastToken];
  }
}

export function applyPatch<T>(state: T, ops: JsonPatchOp[]): T {
  const clone = structuredClone(state);
  for (const op of ops) {
    const tokens = parsePath(op.path);
    switch (op.op) {
      case 'add':
        if (tokens.length === 0) {
          return op.value as T;
        }
        setByPath(clone, tokens, op.value);
        break;
      case 'replace': {
        if (tokens.length === 0) {
          return op.value as T;
        }
        const parent = tokens.slice(0, -1);
        const key = tokens[tokens.length - 1];
        const target = tokens.length === 1 ? clone : getByPath(clone, parent);
        if (target == null || typeof target !== 'object') {
          throw new Error('Path not found for replace');
        }
        if (Array.isArray(target)) {
          const idx = Number(key);
          if (Number.isNaN(idx) || idx < 0 || idx >= target.length) {
            throw new Error(`Index out of bounds for replace: ${key}`);
          }
          target[idx] = op.value;
        } else {
          (target as Record<string, unknown>)[key] = op.value;
        }
        break;
      }
      case 'remove':
        removeByPath(clone, tokens);
        break;
      case 'move': {
        if (!op.from) throw new Error('move requires "from"');
        const fromTokens = parsePath(op.from);
        const val = getByPath(clone, fromTokens);
        removeByPath(clone, fromTokens);
        setByPath(clone, tokens, val);
        break;
      }
      case 'copy': {
        if (!op.from) throw new Error('copy requires "from"');
        const fromTokens = parsePath(op.from);
        const val = structuredClone(getByPath(clone, fromTokens));
        setByPath(clone, tokens, val);
        break;
      }
      case 'test': {
        const actual = getByPath(clone, tokens);
        if (JSON.stringify(actual) !== JSON.stringify(op.value)) {
          throw new Error(
            `Test failed: ${op.path} expected ${JSON.stringify(op.value)}, got ${JSON.stringify(actual)}`,
          );
        }
        break;
      }
    }
  }
  return clone as T;
}

// --- Hook ---

export interface UseAGUIStateOptions<T> {
  initialState: T;
  validatePatch?: (ops: JsonPatchOp[], currentState: T) => boolean;
  /** Callback invoked on any state change. Fires for applySnapshot, applyDelta, and reset. */
  onChange?: (newState: T, prevState: T) => void;
  /** Callback invoked when applyDelta fails to apply a patch. If omitted, the exception propagates. */
  onError?: (error: unknown, ops: JsonPatchOp[]) => void;
}

export interface UseAGUIStateReturn<T> {
  state: T;
  applySnapshot: (snapshot: T) => void;
  /** Applies JSON Patch operations. Throws if the patch is invalid; state remains unchanged. */
  applyDelta: (ops: JsonPatchOp[]) => void;
  reset: () => void;
  snapshotVersion: number;
}

export function useAGUIState<T>(options: UseAGUIStateOptions<T>): UseAGUIStateReturn<T> {
  const { initialState, validatePatch, onChange, onError } = options;
  const [state, setState] = useState<T>(initialState);
  const [snapshotVersion, setSnapshotVersion] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const initialStateRef = useRef(initialState);

  const applySnapshot = useCallback(
    (snapshot: T) => {
      const prev = stateRef.current;
      setState(snapshot);
      stateRef.current = snapshot;
      setSnapshotVersion((v) => v + 1);
      onChange?.(snapshot, prev);
    },
    [onChange],
  );

  const applyDelta = useCallback(
    (ops: JsonPatchOp[]) => {
      const prev = stateRef.current;
      if (validatePatch && !validatePatch(ops, prev)) {
        return;
      }
      try {
        const next = applyPatch(prev, ops);
        setState(next);
        stateRef.current = next;
        onChange?.(next, prev);
      } catch (e) {
        if (onError) {
          onError(e, ops);
        } else {
          throw e;
        }
      }
    },
    [validatePatch, onChange, onError],
  );

  const reset = useCallback(() => {
    const prev = stateRef.current;
    const fresh = structuredClone(initialStateRef.current);
    setState(fresh);
    stateRef.current = fresh;
    setSnapshotVersion(0);
    onChange?.(fresh, prev);
  }, [onChange]);

  return { state, applySnapshot, applyDelta, reset, snapshotVersion };
}
