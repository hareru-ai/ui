'use client';

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@hareru/ui';

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <div
          style={{
            padding: '1rem 0',
            fontSize: '0.875rem',
            color: 'var(--hui-color-muted-foreground)',
          }}
        >
          Profile form fields would go here.
        </div>
      </SheetContent>
    </Sheet>
  );
}
