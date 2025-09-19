import React, { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onEnter?: () => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "0", 
  className = "", 
  onEnter 
}) => {
  const [minutes, setMinutes] = useState(value.split(':')[0] || '');
  const [seconds, setSeconds] = useState(value.split(':')[1] || '');
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const updateValue = (newMinutes: string, newSeconds: string) => {
    const formattedTime = `${newMinutes}:${newSeconds.padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value.replace(/\D/g, '');
    setMinutes(newMinutes);
    updateValue(newMinutes, seconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSeconds = e.target.value.replace(/\D/g, '');
    if (parseInt(newSeconds) > 59) {
      newSeconds = '59';
    }
    setSeconds(newSeconds);
    updateValue(minutes, newSeconds);
  };

  const handleMinutesKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      secondsRef.current?.focus();
    }
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  const handleSecondsKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      minutesRef.current?.focus();
    }
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
  <div className={`flex items-center space-x-4 ${className}`}>
  <div className="relative flex items-center">
        <Input
          ref={minutesRef}
          type="text"
          value={minutes}
          onChange={handleMinutesChange}
          onKeyDown={handleMinutesKeyDown}
          placeholder="0"
          className="w-16 text-center bg-white/5 border-white/20 backdrop-blur-glass text-cinema-text placeholder:text-cinema-text-muted focus:border-cinema-accent focus:ring-cinema-accent/30"
          maxLength={3}
        />
        <span className="ml-3 text-cinema-text-muted text-sm">M</span>
      </div>
      
  <div className="relative flex items-center">
        <Input
          ref={secondsRef}
          type="text"
          value={seconds}
          onChange={handleSecondsChange}
          onKeyDown={handleSecondsKeyDown}
          placeholder="00"
          className="w-16 text-center bg-white/5 border-white/20 backdrop-blur-glass text-cinema-text placeholder:text-cinema-text-muted focus:border-cinema-accent focus:ring-cinema-accent/30"
          maxLength={2}
        />
        <span className="ml-3 text-cinema-text-muted text-sm">S</span>
      </div>
    </div>
  );
};
