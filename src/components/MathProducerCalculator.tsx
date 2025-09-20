import React, { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BatchRangeInput } from './BatchRangeInput';
import { FreeformListInput } from './FreeformListInput';
import { ScreenshotInput } from './ScreenshotInput';
import { SimpleTimeCalculator } from './SimpleTimeCalculator';
import { parseTimeString, formatTotalTime, formatTotalTimeWithDecimal } from '@/lib/timeUtils';
import { Calculator, Hash, FileText, Camera, Clock } from 'lucide-react';

interface Duration {
  episode: string;
  minutes: number;
}

export const MathProducerCalculator = () => {
  const [durations, setDurations] = useState<Duration[]>([]);
  const [activeSection, setActiveSection] = useState<string>('range');

  const totalStats = useMemo(() => {
    const totalMinutes = durations.reduce((sum, d) => sum + d.minutes, 0);
    const totalEpisodes = durations.length;
    return { totalMinutes, totalEpisodes };
  }, [durations]);

  const handleDurationsUpdate = (newDurations: Duration[]) => {
    setDurations(newDurations);
  };

  return (
    <div className="min-h-screen bg-cinema-bg flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Calculator className="w-12 h-12 text-cinema-accent mr-4" />
            <h1 className="font-heading font-black text-4xl md:text-5xl text-cinema-text tracking-wider uppercase">
              Get An A+ in Your Weekly Report
            </h1>
          </div>
          <p className="font-heading font-medium text-xl text-cinema-text-muted tracking-wide uppercase">
            Calculate Total Episode Time & More
          </p>
        </div>

        {/* Main Calculator Card with Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-scale-in">
          <Accordion value={activeSection} onValueChange={setActiveSection} type="single" collapsible className="w-full">
            
            {/* Batch Range Input */}
            <AccordionItem value="range" className="border-b border-white/10">
              <AccordionTrigger className="flex-1 h-16 px-8 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted hover:text-cinema-accent data-[state=open]:text-cinema-accent transition-all duration-300 hover:no-underline">
                <div className="flex items-center">
                  <Hash className="w-5 h-5 mr-3" />
                  Batch Episode Input
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-8 md:p-12">
                <BatchRangeInput onDurationsUpdate={handleDurationsUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* Freeform List Input and Screenshot OCR temporarily hidden */}
            <AccordionItem value="screenshot" className="border-b border-white/10">
              <AccordionTrigger className="flex-1 h-16 px-8 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted hover:text-cinema-accent data-[state=open]:text-cinema-accent transition-all duration-300 hover:no-underline">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 mr-3" />
                  Screenshot Uploading
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-8 md:p-12">
                <ScreenshotInput onDurationsUpdate={handleDurationsUpdate} />
              </AccordionContent>
            </AccordionItem>

            {/* Simple Time Calculator */}
            <AccordionItem value="calculator" className="border-b-0">
              <AccordionTrigger className="flex-1 h-16 px-8 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted hover:text-cinema-accent data-[state=open]:text-cinema-accent transition-all duration-300 hover:no-underline">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3" />
                  Simple Time Calculator
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-8 md:p-12">
                <SimpleTimeCalculator />
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          {/* Results Display */}
          {durations.length > 0 && (
            <div className="border-t border-white/10 bg-white/5 backdrop-blur-glass p-8 md:p-12 animate-fade-in">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <p className="font-heading font-bold text-2xl text-cinema-accent uppercase tracking-wider">
                    {totalStats.totalEpisodes} Episode{totalStats.totalEpisodes !== 1 ? 's' : ''}
                  </p>
                  <p className="font-heading font-black text-5xl md:text-6xl text-cinema-text tracking-wide">
                    {formatTotalTimeWithDecimal(totalStats.totalMinutes)}
                  </p>
                </div>
                
                {/* Episode breakdown preview */}
                <div className="max-h-32 overflow-y-auto space-y-1 opacity-75">
                  {durations.slice(0, 5).map((duration, index) => (
                    <div key={index} className="text-sm text-cinema-text-muted font-body">
                      {duration.episode}: {formatTotalTime(duration.minutes)}
                    </div>
                  ))}
                  {durations.length > 5 && (
                    <div className="text-sm text-cinema-text-muted font-body">
                      ... and {durations.length - 5} more episodes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 opacity-50">
          <p className="font-body text-sm text-cinema-text uppercase tracking-wider">
            Powered by Paparoti • Built for Producers & Audio Engineers
          </p>
        </div>
      </div>
    </div>
  );
};
