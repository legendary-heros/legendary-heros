import React from 'react';
import { cn } from '@/lib/utils';

export interface ILabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // Label-specific props can be added here
}

const Label = React.forwardRef<HTMLLabelElement, ILabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
