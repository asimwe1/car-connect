import React from 'react';
import { 
  Select as BaseSelect, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export const Select = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect>
>((props, ref) => {
  return <BaseSelect {...props} />;
});

Select.displayName = 'Select';

export { SelectContent, SelectItem, SelectTrigger, SelectValue };