'use client';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@hareru/ui';

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={['item-1']} style={{ width: '100%', maxWidth: '28rem' }}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>What is Hareru UI?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Hareru UI is a semantic CSS design system with accessible React components built on Base
          UI.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionHeader>
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Yes. All interactive components follow WAI-ARIA guidelines and support keyboard
          navigation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionHeader>
          <AccordionTrigger>Can I customize the styles?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Yes. Components expose CSS custom properties under the <code>--hui-</code> prefix for full
          theming control.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
