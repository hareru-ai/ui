import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';

describe('Avatar', () => {
  it('renders fallback when no image', () => {
    render(
      <Avatar>
        <AvatarImage alt="user" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders image when loaded', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/photo.jpg" alt="user" data-testid="avatar-img" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const img = screen.getByTestId('avatar-img');
    fireEvent.load(img);
    expect(img).toHaveClass('hui-avatar__image');
  });

  it('shows fallback on image error', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/broken.jpg" alt="user" data-testid="avatar-img" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const img = screen.getByTestId('avatar-img');
    fireEvent.error(img);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('merges className on root', () => {
    render(
      <Avatar className="custom" data-testid="avatar">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('hui-avatar', 'custom');
  });

  it('passes alt to image', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/photo.jpg" alt="John Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Avatar ref={ref}>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has correct displayName for all sub-components', () => {
    expect(Avatar.displayName).toBe('Avatar');
    expect(AvatarImage.displayName).toBe('AvatarImage');
    expect(AvatarFallback.displayName).toBe('AvatarFallback');
  });

  it('renders fallback text content', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText('AB');
    expect(fallback).toHaveClass('hui-avatar__fallback');
  });
});
