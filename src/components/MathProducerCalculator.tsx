import React, { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BatchRangeInput } from './BatchRangeInput';
import { FreeformListInput } from './FreeformListInput';
import { ScreenshotInput } from './ScreenshotInput';
import { SimpleTimeCalculator } from './SimpleTimeCalculator';
import { parseTimeString, formatTotalTime, formatTotalTimeWithDecimal } from '@/lib/timeUtils';
import { Calculator, Hash, FileText, Camera, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Duration {
  episode: string;
  minutes: number;
}

export const MathProducerCalculator = () => {
  const [episodeRange, setEpisodeRange] = useState<string>('');
  // Helper to parse episode range string (e.g., "21-30")
  function getEpisodeRangeNumbers(range: string, count: number): string[] {
    const match = range.match(/^(\d+)-(\d+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (end >= start) {
        return Array.from({ length: count }, (_, i) => String(start + i <= end ? start + i : end));
      }
    }
    return [];
  }
  const [editingEpisodes, setEditingEpisodes] = useState<string[] | null>(null);
  // Function to update episode number for a specific entry
  const handleEditEpisodeNumber = (index: number, newEpisode: string) => {
    // Single cell edit (legacy, not used in bulk save)
    if (activeTab === 'range') {
      const updated = [...rangeDurations];
      updated[index] = { ...updated[index], episode: newEpisode };
      setRangeDurations(updated);
    } else if (activeTab === 'screenshot') {
      const updated = [...screenshotDurations];
      updated[index] = { ...updated[index], episode: newEpisode };
      setScreenshotDurations(updated);
    } else if (activeTab === 'calculator') {
      const updated = [...calculatorDurations];
      updated[index] = { ...updated[index], episode: newEpisode };
      setCalculatorDurations(updated);
    }
  };

  const handleBulkSaveEpisodes = (episodes: string[]) => {
    if (activeTab === 'range') {
      const updated = rangeDurations.map((d, i) => ({ ...d, episode: episodes[i] }));
      setRangeDurations(updated);
    } else if (activeTab === 'screenshot') {
      const updated = screenshotDurations.map((d, i) => ({ ...d, episode: episodes[i] }));
      setScreenshotDurations(updated);
    } else if (activeTab === 'calculator') {
      const updated = calculatorDurations.map((d, i) => ({ ...d, episode: episodes[i] }));
      setCalculatorDurations(updated);
    }
  };
  const [durations, setDurations] = useState<Duration[]>([]);
  const [activeTab, setActiveTab] = useState<string>('screenshot');
  const [rangeDurations, setRangeDurations] = useState<Duration[]>([]);
  const [screenshotDurations, setScreenshotDurations] = useState<Duration[]>([]);
  const [calculatorDurations, setCalculatorDurations] = useState<Duration[]>([]);

  const totalStats = useMemo(() => {
    let list = [];
    if (activeTab === 'range') list = rangeDurations;
    else if (activeTab === 'screenshot') list = screenshotDurations;
    else if (activeTab === 'calculator') list = calculatorDurations;
    const totalMinutes = list.reduce((sum, d) => sum + d.minutes, 0);
    const totalEpisodes = list.length;
    return { totalMinutes, totalEpisodes, list };
  }, [activeTab, rangeDurations, screenshotDurations, calculatorDurations]);

  const handleDurationsUpdate = (newDurations: Duration[]) => {
    if (activeTab === 'range') setRangeDurations(newDurations);
    else if (activeTab === 'screenshot') setScreenshotDurations(newDurations);
    else if (activeTab === 'calculator') setCalculatorDurations(newDurations);
  };

  const [copiedTotal, setCopiedTotal] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  // Helper to reset copy state after 1.5s
  const showCopied = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 1500);
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

        {/* Main Calculator Card with Tabs */}
        <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-scale-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto bg-transparent border-b border-white/10 rounded-none p-0">
              <TabsTrigger 
                value="screenshot" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <Camera className="w-5 h-5 mr-3" />
                Screenshot Uploading
              </TabsTrigger>
              <TabsTrigger 
                value="range" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <Hash className="w-5 h-5 mr-3" />
                Manual Episode Input
              </TabsTrigger>
              <TabsTrigger 
                value="calculator" 
                className="flex-1 h-16 bg-transparent border-0 font-heading font-semibold text-base uppercase tracking-wide text-cinema-text-muted data-[state=active]:text-cinema-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cinema-accent transition-all duration-300"
              >
                <Clock className="w-5 h-5 mr-3" />
                Simple Time Calculator
              </TabsTrigger>
            </TabsList>

            <div className="p-8 md:p-12">
              <TabsContent value="screenshot" className="mt-0 focus-visible:outline-none">
                <ScreenshotInput onDurationsUpdate={handleDurationsUpdate} />
              </TabsContent>
              <TabsContent value="range" className="mt-0 focus-visible:outline-none">
                <BatchRangeInput onDurationsUpdate={handleDurationsUpdate} />
              </TabsContent>
              <TabsContent value="calculator" className="mt-0 focus-visible:outline-none">
                <SimpleTimeCalculator />
              </TabsContent>
            </div>
          </Tabs>

          {/* Results Display */}
          {totalStats.list.length > 0 && (
            <div className="space-y-6">
              {/* Total summary box */}
              <div className="border-t border-white/10 bg-white/10 backdrop-blur-lg p-8 md:p-12 animate-fade-in rounded-xl shadow-lg relative">
                <button
                  className="absolute top-6 right-8 px-3 py-1 bg-cinema-accent text-cinema-bg rounded font-heading text-xs uppercase tracking-wide hover:bg-cinema-accent/90 transition-colors duration-200 z-10"
                  onClick={() => {
                    navigator.clipboard.writeText(formatTotalTimeWithDecimal(totalStats.totalMinutes));
                    showCopied(setCopiedTotal);
                  }}
                  disabled={copiedTotal}
                >
                  {copiedTotal ? 'Copied!' : 'Copy Total'}
                </button>
                <div className="text-center space-y-2">
                  <p className="font-heading font-bold text-2xl text-cinema-accent uppercase tracking-wider">
                    {totalStats.totalEpisodes} Episode{totalStats.totalEpisodes !== 1 ? 's' : ''}
                  </p>
                  <p className="font-heading font-black text-5xl md:text-6xl text-cinema-text tracking-wide">
                    {formatTotalTimeWithDecimal(totalStats.totalMinutes)}
                  </p>
                </div>
              </div>
              {/* Episode breakdown box */}
              <div className="border-t border-white/10 bg-white/10 backdrop-blur-lg p-8 md:p-12 animate-fade-in rounded-xl shadow-lg">
                <div className="font-heading font-semibold text-base text-cinema-text-muted mb-2">Episode Breakdown (CSV)</div>
                <div className="mb-4 flex items-center gap-2">
                  <label className="font-heading text-cinema-text-muted text-sm">Episode Range:</label>
                  <input
                    type="text"
                    value={episodeRange}
                    onChange={e => setEpisodeRange(e.target.value)}
                    placeholder="e.g. 21-30"
                    className="bg-cinema-bg border border-cinema-accent rounded px-2 py-1 w-24 text-cinema-text focus:outline-none"
                  />
                  <button
                    className="px-3 py-1 bg-cinema-accent text-cinema-bg rounded font-heading text-xs uppercase tracking-wide hover:bg-cinema-accent/90"
                    onClick={() => {
                      if (!episodeRange) return;
                      const numbers = getEpisodeRangeNumbers(episodeRange, totalStats.list.length);
                      if (numbers.length === totalStats.list.length) {
                        handleBulkSaveEpisodes(numbers);
                        setEditingEpisodes(null);
                      }
                    }}
                  >Apply Range</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body text-cinema-text-muted border-collapse">
                    <div className="flex items-center justify-end mb-2">
                      <button
                        className="px-3 py-1 bg-cinema-accent text-cinema-bg rounded font-heading text-xs uppercase tracking-wide hover:bg-cinema-accent/90 transition-colors duration-200"
                        onClick={() => {
                          const csv = totalStats.list.map((duration) => {
                            let epNum = duration.episode;
                            if (!/^Episode\s*/i.test(epNum)) {
                              epNum = `Episode ${epNum}`;
                            }
                            const min = Math.floor(duration.minutes);
                            const sec = Math.round((duration.minutes - min) * 60);
                            const decimal = duration.minutes.toFixed(2);
                            return `${epNum}\t${min}\t${sec}\t${decimal}`;
                          }).join('\n');
                          navigator.clipboard.writeText(csv);
                          showCopied(setCopiedCSV);
                        }}
                        disabled={copiedCSV}
                      >
                        {copiedCSV ? 'Copied!' : 'Copy Ep/Min/Sec/Decimal'}
                      </button>
                    </div>
                    <table className="w-full text-left text-sm font-body text-cinema-text-muted border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="px-3 py-2 font-heading font-bold">Order</th>
                          <th className="px-3 py-2 font-heading font-bold">Episode</th>
                          <th className="px-3 py-2 font-heading font-bold">Minutes</th>
                          <th className="px-3 py-2 font-heading font-bold">Seconds</th>
                          <th className="px-3 py-2 font-heading font-bold">Decimal</th>
                          <th className="px-3 py-2 font-heading font-bold">Min & Sec</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(editingEpisodes ? editingEpisodes : totalStats.list.map(d => d.episode)).map((ep, index) => {
                          const duration = totalStats.list[index];
                          const decimal = duration.minutes.toFixed(2);
                          const min = Math.floor(duration.minutes);
                          const sec = Math.round((duration.minutes - min) * 60);
                          return (
                            <tr key={index} className="border-b border-white/10">
                              <td className="px-3 py-2">{index + 1}</td>
                              <td className="px-3 py-2">
                                {editingEpisodes ? (
                                  <input
                                    type="text"
                                    value={ep}
                                    className="bg-transparent border-b border-cinema-accent px-1 w-20 text-cinema-text focus:outline-none"
                                    onChange={e => {
                                      const newEpisodes = [...editingEpisodes];
                                      newEpisodes[index] = e.target.value;
                                      setEditingEpisodes(newEpisodes);
                                    }}
                                    style={{ fontWeight: 'bold' }}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 'bold' }}>{ep}</span>
                                )}
                              </td>
                              <td className="px-3 py-2">{min}</td>
                              <td className="px-3 py-2">{sec}</td>
                              <td className="px-3 py-2">{decimal}</td>
                              <td className="px-3 py-2">{min}m {sec}s</td>
                            </tr>
                          );
                        })}
                        {totalStats.list.length > 0 && (
                          <tr>
                            <td colSpan={6} className="pt-4">
                              {editingEpisodes ? (
                                <>
                                  <button
                                    className="px-4 py-2 bg-cinema-accent text-cinema-bg rounded font-heading text-xs uppercase tracking-wide hover:bg-cinema-accent/90 mr-2"
                                    onClick={() => {
                                      handleBulkSaveEpisodes(editingEpisodes);
                                      setEditingEpisodes(null);
                                    }}
                                  >Save All</button>
                                  <button
                                    className="px-4 py-2 bg-gray-600 text-white rounded font-heading text-xs uppercase tracking-wide hover:bg-gray-700"
                                    onClick={() => setEditingEpisodes(null)}
                                  >Cancel</button>
                                </>
                              ) : (
                                <button
                                  className="px-4 py-2 bg-cinema-accent text-cinema-bg rounded font-heading text-xs uppercase tracking-wide hover:bg-cinema-accent/90"
                                  onClick={() => setEditingEpisodes(totalStats.list.map(d => d.episode))}
                                >Edit All Episodes</button>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </table>
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
