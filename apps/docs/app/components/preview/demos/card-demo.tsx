'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@hareru/ui';

export default function CardDemo() {
  return (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description with supporting text.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card component.</p>
      </CardContent>
      <CardFooter style={{ display: 'flex', gap: '0.5rem' }}>
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
