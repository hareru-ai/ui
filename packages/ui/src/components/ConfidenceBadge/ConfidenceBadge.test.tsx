import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ConfidenceBadge } from './ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('renders with level "auto" and applies --auto class', () => {
    render(<ConfidenceBadge level="auto" />);
    const badge = screen.getByTitle('Confidence: auto');
    expect(badge).toHaveClass('hui-confidence-badge', 'hui-confidence-badge--auto');
    expect(badge).toHaveTextContent('Auto');
  });

  it('renders with level "validated" and applies --validated class', () => {
    render(<ConfidenceBadge level="validated" />);
    const badge = screen.getByTitle('Confidence: validated');
    expect(badge).toHaveClass('hui-confidence-badge', 'hui-confidence-badge--validated');
    expect(badge).toHaveTextContent('Validated');
  });

  it('renders with level "reviewed" and applies --reviewed class', () => {
    render(<ConfidenceBadge level="reviewed" />);
    const badge = screen.getByTitle('Confidence: reviewed');
    expect(badge).toHaveClass('hui-confidence-badge', 'hui-confidence-badge--reviewed');
    expect(badge).toHaveTextContent('Reviewed');
  });

  it('renders with level "authored" and applies --authored class', () => {
    render(<ConfidenceBadge level="authored" />);
    const badge = screen.getByTitle('Confidence: authored');
    expect(badge).toHaveClass('hui-confidence-badge', 'hui-confidence-badge--authored');
    expect(badge).toHaveTextContent('Authored');
  });

  it('displays score as percentage (0.87 -> "87%")', () => {
    render(<ConfidenceBadge level="reviewed" score={0.87} />);
    const badge = screen.getByTitle('Confidence: reviewed (87%)');
    expect(badge).toHaveTextContent('Reviewed 87%');
  });

  it('hides score when showScore=false', () => {
    render(<ConfidenceBadge level="reviewed" score={0.87} showScore={false} />);
    const badge = screen.getByTitle('Confidence: reviewed (87%)');
    expect(badge).toHaveTextContent('Reviewed');
    expect(badge).not.toHaveTextContent('87%');
  });

  it('shows only level label when score is undefined', () => {
    render(<ConfidenceBadge level="auto" />);
    const badge = screen.getByTitle('Confidence: auto');
    expect(badge).toHaveTextContent('Auto');
    expect(badge).not.toHaveTextContent('%');
  });

  it('applies --sm class by default', () => {
    render(<ConfidenceBadge level="auto" />);
    const badge = screen.getByTitle('Confidence: auto');
    expect(badge).toHaveClass('hui-confidence-badge--sm');
  });

  it('applies --md class when size="md"', () => {
    render(<ConfidenceBadge level="auto" size="md" />);
    const badge = screen.getByTitle('Confidence: auto');
    expect(badge).toHaveClass('hui-confidence-badge--md');
    expect(badge).not.toHaveClass('hui-confidence-badge--sm');
  });

  it('sets data-level attribute', () => {
    render(<ConfidenceBadge level="validated" />);
    const badge = screen.getByTitle('Confidence: validated');
    expect(badge).toHaveAttribute('data-level', 'validated');
  });

  it('sets title attribute with level and score', () => {
    render(<ConfidenceBadge level="reviewed" score={0.92} />);
    expect(screen.getByTitle('Confidence: reviewed (92%)')).toBeInTheDocument();
  });

  it('sets title attribute without score when score is undefined', () => {
    render(<ConfidenceBadge level="auto" />);
    expect(screen.getByTitle('Confidence: auto')).toBeInTheDocument();
  });

  it('forwards className', () => {
    render(<ConfidenceBadge level="auto" className="custom-class" />);
    const badge = screen.getByTitle('Confidence: auto');
    expect(badge).toHaveClass('hui-confidence-badge', 'custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<ConfidenceBadge level="auto" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('hui-confidence-badge');
  });
});
