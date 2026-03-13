import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

describe('Card', () => {
  it('renders a complete card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Title')).toHaveClass('hui-card__title');
    expect(screen.getByText('Description')).toHaveClass('hui-card__description');
    expect(screen.getByText('Content')).toHaveClass('hui-card__content');
    expect(screen.getByText('Footer')).toHaveClass('hui-card__footer');
  });

  it('uses semantic HTML elements', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card').tagName).toBe('ARTICLE');
    expect(screen.getByTestId('header').tagName).toBe('HEADER');
    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
  });

  it('merges custom className on all sub-components', () => {
    render(
      <Card className="c1">
        <CardHeader className="c2">
          <CardTitle className="c3">T</CardTitle>
          <CardDescription className="c4">D</CardDescription>
        </CardHeader>
        <CardContent className="c5">C</CardContent>
        <CardFooter className="c6">F</CardFooter>
      </Card>,
    );

    expect(screen.getByText('T').closest('header')).toHaveClass('hui-card__header', 'c2');
    expect(screen.getByText('T')).toHaveClass('hui-card__title', 'c3');
  });
});
