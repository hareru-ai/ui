import { getComponentOrThrow, hasStatesContent } from '@/lib/registry';
import type { StateDef } from '@hareru/registry';

function renderCssReflection(state: StateDef): string {
  if (!state.cssReflection) return '—';
  if (state.cssReflection === 'modifier') return 'BEM modifier';
  return 'data attribute';
}

export function RegistryStates({ name }: { name: string }) {
  const entry = getComponentOrThrow(name);
  const states = entry.states;
  if (!hasStatesContent(states)) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>State</th>
          <th>Type</th>
          <th>Values</th>
          <th>Default</th>
          <th>CSS Reflection</th>
        </tr>
      </thead>
      <tbody>
        {states?.map((state) => (
          <tr key={state.name}>
            <td>
              <code>{state.name}</code>
            </td>
            <td>
              <code>{state.type}</code>
            </td>
            <td>
              {state.type === 'enum'
                ? state.values.map((v, i) => (
                    <span key={v}>
                      {i > 0 && ' | '}
                      <code>{v}</code>
                    </span>
                  ))
                : '—'}
            </td>
            <td>
              {state.type === 'enum' && state.defaultValue ? (
                <code>{state.defaultValue}</code>
              ) : (
                '—'
              )}
            </td>
            <td>{renderCssReflection(state)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
