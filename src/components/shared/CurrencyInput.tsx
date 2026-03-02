import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface CurrencyInputProps {
  value?: number | string;
  onCustomValueChange?: (value: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onCustomValueChange, value, ...props }, ref) => {
    return (
      <NumericFormat
        value={value}
        getInputRef={ref}
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        onValueChange={(values) => {
          onCustomValueChange?.(values.floatValue);
        }}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
