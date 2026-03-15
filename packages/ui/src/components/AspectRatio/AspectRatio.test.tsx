import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="test.jpg" alt="Test" />
      </AspectRatio>,
    );
    expect(screen.getByAltText('Test')).toBeInTheDocument();
  });

  it('renders with custom ratio', () => {
    const { container } = render(
      <AspectRatio ratio={4 / 3}>
        <div data-testid="inner">Content</div>
      </AspectRatio>,
    );
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });

  it('renders without ratio (defaults to 1)', () => {
    render(
      <AspectRatio>
        <span>Square</span>
      </AspectRatio>,
    );
    expect(screen.getByText('Square')).toBeInTheDocument();
  });
});
