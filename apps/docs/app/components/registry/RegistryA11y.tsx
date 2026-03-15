import { getComponentOrThrow, hasA11yContent } from '@/lib/registry';

export function RegistryA11y({ name }: { name: string }) {
  const entry = getComponentOrThrow(name);
  if (!hasA11yContent(entry.a11y)) return null;

  // hasA11yContent guarantees a11y is defined and has content
  const a11y = entry.a11y as NonNullable<typeof entry.a11y>;

  return (
    <ul>
      {a11y.roles?.length ? (
        <li>
          <strong>Roles:</strong>{' '}
          {a11y.roles.map((role, i) => (
            <span key={role}>
              {i > 0 && ', '}
              <code>{role}</code>
            </span>
          ))}
        </li>
      ) : null}

      {a11y.ariaAttributes?.length ? (
        <li>
          <strong>ARIA attributes:</strong>{' '}
          {a11y.ariaAttributes.map((attr, i) => (
            <span key={attr}>
              {i > 0 && ', '}
              <code>{attr}</code>
            </span>
          ))}
        </li>
      ) : null}

      {a11y.semanticElements?.length ? (
        <li>
          <strong>Semantic elements:</strong>{' '}
          {a11y.semanticElements.map((el, i) => (
            <span key={el}>
              {i > 0 && ', '}
              <code>{el}</code>
            </span>
          ))}
        </li>
      ) : null}

      {a11y.keyboardInteractions?.length ? (
        <li>
          <strong>Keyboard:</strong>
          <ul>
            {a11y.keyboardInteractions.map((interaction) => (
              <li key={interaction}>{interaction}</li>
            ))}
          </ul>
        </li>
      ) : null}

      {a11y.liveRegion ? (
        <li>
          <strong>Live region:</strong> Yes (screen readers announce changes automatically)
        </li>
      ) : null}

      {a11y.notes ? (
        <li>
          <strong>Notes:</strong> {a11y.notes}
        </li>
      ) : null}
    </ul>
  );
}
