import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { parseVideoList } from '@/lib/timeUtils';
import { Camera, Upload, Loader2, FileImage } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface Duration {
  episode: string;
  minutes: number;
}

interface ScreenshotInputProps {
  onDurationsUpdate: (durations: Duration[]) => void;
}

export const ScreenshotInput: React.FC<ScreenshotInputProps> = ({ onDurationsUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setExtractedText('');

    try {
      const worker = await createWorker('eng');
      
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      
      // Auto-calculate if text contains recognizable patterns
      const durations = parseVideoList(text);
      if (durations.length > 0) {
        onDurationsUpdate(durations);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      setExtractedText('OCR processing failed. Please try again or use manual input.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  };

  const handleRecalculate = () => {
    if (extractedText) {
      const durations = parseVideoList(extractedText);
      onDurationsUpdate(durations);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <Camera className="w-8 h-8 text-cinema-accent mx-auto" />
        <h3 className="font-heading font-bold text-2xl text-cinema-text uppercase tracking-wider">
          Screenshot OCR
        </h3>
        <p className="font-body text-cinema-text-muted max-w-2xl mx-auto">
          Upload a screenshot of your episode list and let OCR extract the text automatically.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-cinema-accent bg-cinema-accent/5 shadow-glow-accent'
            : 'border-white/20 hover:border-cinema-accent/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('screenshot-input')?.click()}
      >
        <input
          id="screenshot-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-cinema-accent mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="font-heading font-semibold text-cinema-accent uppercase tracking-wide">
                Processing Image
              </p>
              <p className="font-body text-sm text-cinema-text-muted">
                Running OCR analysis...
              </p>
            </div>
          </div>
        ) : uploadedImage ? (
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={uploadedImage}
                alt="Uploaded screenshot"
                className="max-h-48 rounded border border-cinema-border"
              />
              <div className="absolute inset-0 bg-cinema-accent/10 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <FileImage className="w-8 h-8 text-cinema-accent" />
              </div>
            </div>
            <p className="font-body text-sm text-cinema-text-muted">
              Click to upload a different image
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 text-cinema-accent mx-auto" />
            <div className="space-y-2">
              <p className="font-heading font-semibold text-lg text-cinema-text uppercase tracking-wide">
                Drop Screenshot Here
              </p>
              <p className="font-body text-cinema-text-muted">
                or click to browse files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Text Display */}
      {extractedText && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg p-6">
            <h4 className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide mb-4">
              Extracted Text
            </h4>
            <pre
              className="whitespace-pre-wrap font-body text-sm text-cinema-text-muted max-h-48 overflow-y-auto"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRecalculate();
                }
              }}
            >
              {extractedText}
            </pre>
          </div>
          
          <div className="text-center">
            <Button
              onClick={handleRecalculate}
              className="h-12 px-8 bg-cinema-accent hover:bg-cinema-accent/90 text-cinema-bg font-heading font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-accent"
            >
              Recalculate From Text
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white/5 backdrop-blur-glass border border-white/10 rounded-lg p-6 space-y-4">
        <h4 className="font-heading font-semibold text-sm text-cinema-accent uppercase tracking-wide">
          OCR Tips
        </h4>
        <div className="space-y-2 text-sm font-body text-cinema-text-muted">
          <div>• Use high-contrast, clear screenshots</div>
          <div>• Ensure episode names and durations are clearly visible</div>
          <div>• Crop to focus on the episode list area</div>
          <div>• PNG or JPEG formats work best</div>
        </div>
      </div>
    </div>
  );
};
