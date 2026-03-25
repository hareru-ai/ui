import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from './PreviewCard';

describe('PreviewCard', () => {
  it('renders trigger text', () => {
    render(
      <PreviewCard>
        <PreviewCardTrigger href="#">Link text</PreviewCardTrigger>
        <PreviewCardContent>Preview content</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Link text')).toBeInTheDocument();
  });

  it('renders trigger as anchor by default', () => {
    render(
      <PreviewCard>
        <PreviewCardTrigger href="https://example.com">Example</PreviewCardTrigger>
        <PreviewCardContent>Preview</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Example').closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('renders asChild with child element', () => {
    render(
      <PreviewCard>
        <PreviewCardTrigger asChild>
          <button type="button">Custom trigger</button>
        </PreviewCardTrigger>
        <PreviewCardContent>Preview</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByRole('button', { name: 'Custom trigger' })).toBeInTheDocument();
  });

  it('applies BEM class to content', () => {
    render(
      <PreviewCard defaultOpen>
        <PreviewCardTrigger href="#">Trigger</PreviewCardTrigger>
        <PreviewCardContent>Content text</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Content text')).toHaveClass('hui-preview-card__content');
  });

  it('merges className on content', () => {
    render(
      <PreviewCard defaultOpen>
        <PreviewCardTrigger href="#">Trigger</PreviewCardTrigger>
        <PreviewCardContent className="extra">Content</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Content')).toHaveClass('hui-preview-card__content', 'extra');
  });

  it('forwards ref on content', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PreviewCard defaultOpen>
        <PreviewCardTrigger href="#">Trigger</PreviewCardTrigger>
        <PreviewCardContent ref={ref}>Content</PreviewCardContent>
      </PreviewCard>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref on trigger', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <PreviewCard>
        <PreviewCardTrigger ref={ref} href="#">
          Trigger
        </PreviewCardTrigger>
        <PreviewCardContent>Content</PreviewCardContent>
      </PreviewCard>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('accepts sideOffset and side props without error', () => {
    render(
      <PreviewCard defaultOpen>
        <PreviewCardTrigger href="#">Trigger</PreviewCardTrigger>
        <PreviewCardContent sideOffset={8} side="top">
          Content
        </PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('sets displayName on PreviewCardContent', () => {
    expect(PreviewCardContent.displayName).toBe('PreviewCardContent');
  });

  it('sets displayName on PreviewCardTrigger', () => {
    expect(PreviewCardTrigger.displayName).toBe('PreviewCardTrigger');
  });

  it('shows content when open (hover interaction)', () => {
    render(
      <PreviewCard open>
        <PreviewCardTrigger href="#">Hover me</PreviewCardTrigger>
        <PreviewCardContent>Hover content</PreviewCardContent>
      </PreviewCard>,
    );
    expect(screen.getByText('Hover content')).toBeInTheDocument();
  });
});
