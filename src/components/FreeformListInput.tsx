import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseVideoList } from '@/lib/timeUtils';
import { FileText, Calculator } from 'lucide-react';

interface Duration {
  episode: string;
  minutes: number;
}

interface FreeformListInputProps {
  onDurationsUpdate: (durations: Duration[]) => void;
}

export const FreeformListInput: React.FC<FreeformListInputProps> = ({ onDurationsUpdate }) => {
  const [textInput, setTextInput] = useState('');

  const handleCalculate = () => {
    const durations = parseVideoList(textInput);
    onDurationsUpdate(durations);
  };

  const exampleText = `Episode 1 - 23:45
S01E02 (42:12)
Episode 3: 38 minutes
S01E04 - 45m 30s
Episode 5 (1h 2m)`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <FileText className="w-8 h-8 text-cinema-accent mx-auto" />
        <h3 className="font-heading font-bold text-2xl text-cinema-text uppercase tracking-wider">
          Freeform List
        </h3>
        <p className="font-body text-cinema-text-muted max-w-2xl mx-auto">
          Paste or type your episode list with durations in any format. The parser will automatically detect episode names and runtimes.
        </p>
      </div>

      <div className="space-y-6">
        <Label htmlFor="freeform" className="font-heading font-semibold text-sm text-cinema-text uppercase tracking-wide">
          Episode List
        </Label>
        
        <Textarea
          id="freeform"
          placeholder={exampleText}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="min-h-64 bg-white/5 border-white/20 backdrop-blur-glass text-cinema-text placeholder:text-cinema-text-muted resize-none transition-colors duration-300 focus:border-cinema-accent focus:ring-cinema-accent/30"
          rows={12}
        />

        <div className="text-center">
          <Button
            onClick={handleCalculate}
            disabled={!textInput.trim()}
            className="h-12 px-8 bg-cinema-accent hover:bg-cinema-accent/90 text-cinema-bg font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate Total Time
          </Button>
        </div>
      </div>

      {/* Example Format Guide */}
      <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg p-6 space-y-4">
        <h4 className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide">
          Supported Formats
        </h4>
        <div className="space-y-2 text-sm font-body text-cinema-text-muted">
          <div>• <code className="text-cinema-accent">Episode 1 - 23:45</code></div>
          <div>• <code className="text-cinema-accent">S01E02 (42:12)</code></div>
          <div>• <code className="text-cinema-accent">Episode 3: 38 minutes</code></div>
          <div>• <code className="text-cinema-accent">S01E04 - 45m 30s</code></div>
          <div>• <code className="text-cinema-accent">Episode 5 (1h 2m)</code></div>
        </div>
      </div>
    </div>
  );
};