import { useEffect, useRef, useState } from 'react';

interface FlashPriceProps {
  value: string;
  previousValue?: number;
  currentValue: number;
  className?: string;
}

export default function FlashPrice({ value, previousValue, currentValue, className = '' }: FlashPriceProps) {
  const [flashClass, setFlashClass] = useState('');
  const prevRef = useRef(previousValue);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== undefined && prev !== currentValue) {
      if (currentValue > prev) {
        setFlashClass('flash-green');
      } else if (currentValue < prev) {
        setFlashClass('flash-red');
      }

      const timer = setTimeout(() => setFlashClass(''), 800);
      return () => clearTimeout(timer);
    }
    prevRef.current = currentValue;
  }, [currentValue]);

  return (
    <span className={`terminal-number ${flashClass} ${className}`}>
      {value}
    </span>
  );
}
