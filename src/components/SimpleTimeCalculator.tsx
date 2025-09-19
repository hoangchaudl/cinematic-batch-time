import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimeInput } from './TimeInput';
import { calculateTimeDifference, addTimes, formatTotalTime, formatTotalTimeWithDecimal } from '@/lib/timeUtils';
import { Calculator, Plus, Minus } from 'lucide-react';

export const SimpleTimeCalculator: React.FC = () => {
  const [time1, setTime1] = useState('');
  const [time2, setTime2] = useState('');
  const [result, setResult] = useState<{ operation: string; value: number } | null>(null);

  const handleAdd = () => {
    if (time1 && time2) {
      const sum = addTimes(time1, time2);
      setResult({ operation: 'Addition', value: sum });
    }
  };

  const handleSubtract = () => {
    if (time1 && time2) {
      const difference = calculateTimeDifference(time1, time2);
      setResult({ operation: 'Difference', value: difference });
    }
  };

  const handleClear = () => {
    setTime1('');
    setTime2('');
    setResult(null);
  };

  // Handle Enter key to calculate
  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && time1 && time2) {
      handleAdd();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <Calculator className="w-8 h-8 text-cinema-accent mx-auto" />
        <h3 className="font-heading font-bold text-2xl text-cinema-text uppercase tracking-wider">
          Simple Time Calculator
        </h3>
        <p className="font-body text-cinema-text-muted max-w-2xl mx-auto">
          Add or subtract two time values. Use Tab to move between minutes and seconds.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg p-8 shadow-lg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide">
                First Time
              </label>
              <TimeInput
                value={time1}
                onChange={setTime1}
                placeholder="Enter time"
                onEnter={handleAdd}
              />
            </div>
            
            <div className="space-y-3">
              <label className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide">
                Second Time
              </label>
              <TimeInput
                value={time2}
                onChange={setTime2}
                placeholder="Enter time"
                onEnter={handleAdd}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleAdd}
              disabled={!time1 || !time2}
              className="h-12 px-6 bg-cinema-accent hover:bg-cinema-accent/90 text-cinema-bg font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Times
            </Button>
            
            <Button
              onClick={handleSubtract}
              disabled={!time1 || !time2}
              className="h-12 px-6 bg-white/10 hover:bg-white/20 text-cinema-text border border-white/20 font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4 mr-2" />
              Subtract Times
            </Button>
            
            <Button
              onClick={handleClear}
              variant="outline"
              className="h-12 px-6 bg-transparent hover:bg-white/5 text-cinema-text-muted border border-white/10 font-heading font-bold uppercase tracking-wide transition-all duration-300"
            >
              Clear
            </Button>
          </div>

          {result && (
            <div className="text-center space-y-4 pt-6 border-t border-white/10 animate-fade-in">
              <div className="space-y-2">
                <p className="font-heading font-bold text-lg text-cinema-accent uppercase tracking-wider">
                  {result.operation} Result
                </p>
                <p className="font-heading font-black text-4xl text-cinema-text tracking-wide">
                  {formatTotalTimeWithDecimal(result.value)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg p-6 space-y-4">
        <h4 className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide">
          Calculator Tips
        </h4>
        <div className="space-y-2 text-sm font-body text-cinema-text-muted">
          <div>• Use Tab key to move from minutes to seconds</div>
          <div>• Seconds are automatically capped at 59</div>
          <div>• Addition combines both time values</div>
          <div>• Subtraction shows the absolute difference</div>
        </div>
      </div>
    </div>
  );
};
