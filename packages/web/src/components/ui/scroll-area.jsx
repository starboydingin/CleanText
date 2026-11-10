import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

/**
 * Komponen ScrollArea & ScrollBar dari shadcn/ui
 * Berbasis @radix-ui/react-scroll-area
 * https://ui.shadcn.com/docs/components/scroll-area
 */

const ScrollArea = React.forwardRef(({ className = '', children, type = 'always', ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    type={type}
    className={`scroll-area-root ${className}`.trim()}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="scroll-area-viewport">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="vertical" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef(({ className = '', orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={`scroll-area-scrollbar scroll-area-scrollbar--${orientation} ${className}`.trim()}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="scroll-area-thumb" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
