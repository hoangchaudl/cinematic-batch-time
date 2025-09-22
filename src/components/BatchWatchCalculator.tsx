import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BatchRangeInput } from './BatchRangeInput';
import { FreeformListInput } from './FreeformListInput';
import { ScreenshotInput } from './ScreenshotInput';
import { parseTimeString, formatTotalTime } from '@/lib/timeUtils';
import { Clock, Hash, FileText, Camera } from 'lucide-react';

interface Duration {
  episode: string;
  minutes: number;
}

export const BatchWatchCalculator = () => {
  const [activeTab, setActiveTab] = useState('range');
  const [durations, setDurations] = useState<Duration[]>([]);

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
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-cinema-accent mr-4" />
            <h1 className="font-heading font-black text-5xl md:text-6xl text-cinema-text tracking-wider uppercase">
              Batch Watch
            </h1>
          </div>
          <p className="font-heading font-medium text-xl text-cinema-text-muted tracking-wide uppercase">
            Calculate Total Watch Time
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="bg-cinema-card rounded-lg border border-cinema-border shadow-2xl overflow-hidden animate-scale-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="w-full h-auto bg-transparent border-b border-cinema-border rounded-none p-0">
              <TabsTrigger 
                value="range" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <Hash className="w-5 h-5 mr-3" />
                Batch Range
              </TabsTrigger>
              <TabsTrigger 
                value="freeform" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <FileText className="w-5 h-5 mr-3" />
                Freeform List
              </TabsTrigger>
              <TabsTrigger 
                value="screenshot" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <Camera className="w-5 h-5 mr-3" />
                Screenshot Uploading
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="p-8 md:p-12">
              <TabsContent value="range" className="mt-0 focus-visible:outline-none">
                <BatchRangeInput onDurationsUpdate={handleDurationsUpdate} />
              </TabsContent>
              
              <TabsContent value="freeform" className="mt-0 focus-visible:outline-none">
                <FreeformListInput onDurationsUpdate={handleDurationsUpdate} />
              </TabsContent>
              
              <TabsContent value="screenshot" className="mt-0 focus-visible:outline-none">
                <ScreenshotInput onDurationsUpdate={handleDurationsUpdate} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Results Display */}
          {durations.length > 0 && (
            <div className="border-t border-cinema-border bg-cinema-bg/50 p-8 md:p-12 animate-fade-in">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <p className="font-heading font-bold text-2xl text-cinema-accent uppercase tracking-wider">
                    {totalStats.totalEpisodes} Episode{totalStats.totalEpisodes !== 1 ? 's' : ''}
                  </p>
                  <p className="font-heading font-black text-5xl md:text-6xl text-cinema-text tracking-wide">
                    {formatTotalTime(totalStats.totalMinutes)}
                  </p>
                </div>
                
                {/* Episode breakdown preview */}
                <div className="max-h-32 overflow-y-auto space-y-1 opacity-75">
                  {durations.slice(0, 5).map((duration, index) => {
                    const min = Math.floor(duration.minutes);
                    const sec = Math.round((duration.minutes - min) * 60);
                    return (
                      <div key={index} className="text-sm text-cinema-text-muted font-body">
                        {duration.episode}: {min}m {sec}s
                      </div>
                    );
                  })}
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
          <p className="font-body text-sm text-cinema-text-muted uppercase tracking-wider">
            Powered by Paparoti • Built for Producers & Audio Engineers
          </p>
        </div>
      </div>
    </div>
  );
};
