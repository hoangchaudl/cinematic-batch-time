import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseTimeString } from '@/lib/timeUtils';
import { Hash, Play } from 'lucide-react';
import { TimeInput } from './TimeInput';

interface Duration {
  episode: string;
  minutes: number;
}

interface BatchRangeInputProps {
  onDurationsUpdate: (durations: Duration[]) => void;
}

export const BatchRangeInput: React.FC<BatchRangeInputProps> = ({ onDurationsUpdate }) => {
  const [rangeInput, setRangeInput] = useState('');
  const [episodeFields, setEpisodeFields] = useState<Array<{ episode: string; duration: string }>>([]);
  const [showFields, setShowFields] = useState(false);

  const handleGenerateFields = () => {
    const match = rangeInput.match(/(\d+)-(\d+)/);
    if (!match) return;

    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    
    if (start > end || start < 1) return;

    const fields = [];
    for (let i = start; i <= end; i++) {
      fields.push({ episode: `Episode ${i}`, duration: '' });
    }

    setEpisodeFields(fields);
    setShowFields(true);
  };

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...episodeFields];
    newFields[index].duration = value;
    setEpisodeFields(newFields);
  };

  const handleCalculate = () => {
    const durations: Duration[] = episodeFields
      .filter(field => field.duration.trim())
      .map(field => ({
        episode: field.episode,
        minutes: parseTimeString(field.duration)
      }))
      .filter(d => d.minutes > 0);

    onDurationsUpdate(durations);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Range Input Section */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Hash className="w-8 h-8 text-cinema-accent mx-auto" />
          <h3 className="font-heading font-bold text-2xl text-cinema-text uppercase tracking-wider">
            Episode Range
          </h3>
          <p className="font-body text-cinema-text-muted">
            Enter a range like "21-40" to generate individual episode fields
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Label htmlFor="range" className="font-heading font-semibold text-sm text-cinema-text uppercase tracking-wide">
            Enter Range
          </Label>
          <Input
            id="range"
            type="text"
            placeholder="e.g., 21-40"
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
            className="h-12 bg-white/5 border-white/20 backdrop-blur-glass text-cinema-text placeholder:text-cinema-text-muted focus:border-cinema-accent focus:ring-cinema-accent/30 transition-colors duration-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && rangeInput.match(/^\d+-\d+$/)) {
                e.preventDefault();
                handleGenerateFields();
              }
            }}
          />
          <Button
            onClick={handleGenerateFields}
            disabled={!rangeInput.match(/^\d+-\d+$/)}
            className="w-full h-12 bg-cinema-accent hover:bg-cinema-accent/90 text-cinema-bg font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 mr-2" />
            Generate Fields
          </Button>
        </div>
      </div>

      {/* Episode Fields */}
      {showFields && (
        <div className="space-y-6 animate-fade-in-stagger">
          <div className="border-t border-white/10 pt-8">
            <h4 className="font-heading font-bold text-xl text-cinema-text uppercase tracking-wider text-center mb-8">
              Episode Durations
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
              {episodeFields.map((field, index) => (
                <div 
                  key={index} 
                  className="space-y-3"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Label 
                    htmlFor={`episode-${index}`}
                    className="font-heading font-medium text-sm text-cinema-accent uppercase tracking-wide"
                  >
                    {field.episode}
                  </Label>
                  <TimeInput
                    value={field.duration}
                    onChange={(duration) => handleFieldChange(index, duration)}
                    placeholder="0:00"
                    className="w-full"
                    onEnter={handleCalculate}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={handleCalculate}
                disabled={!episodeFields.some(field => field.duration.trim())}
                className="h-12 px-8 bg-cinema-accent hover:bg-cinema-accent/90 text-cinema-bg font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Total Time
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
