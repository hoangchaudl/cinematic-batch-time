/**
 * Preprocess OCR text to improve episode/duration extraction
 * - Merges lines split by OCR
 * - Removes extra spaces and non-printable characters
 * - Ensures each episode is on one line
 */
export function preprocessOcrText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  // Remove non-printable characters
  let cleaned = text.replace(/[^\x20-\x7E\n]/g, '');
  // Replace multiple spaces/tabs with a single space
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
  // Merge lines that are split in the middle of an episode row (e.g., if a line ends with a comma or is very short)
  cleaned = cleaned.replace(/\n(?=\S{0,5}\s)/g, ' ');
  // Remove extra blank lines
  cleaned = cleaned.replace(/\n{2,}/g, '\n');
  // Trim each line
  cleaned = cleaned.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
  return cleaned;
}
/**
 * Format total minutes into a readable time string and decimal minutes
 * Returns: 'X min Y sec (Z.Z min)'
 */
export function formatTotalTimeWithDecimal(totalMinutes: number): string {
  const totalSeconds = Math.floor(totalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const decimalMinutes = (totalSeconds / 60).toFixed(2);
  if (seconds === 0) {
    return `${minutes} min (${decimalMinutes} min)`;
  }
  if (minutes === 0) {
    return `${seconds} sec (${decimalMinutes} min)`;
  }
  return `${minutes} min ${seconds} sec (${decimalMinutes} min)`;
}
interface Duration {
  episode: string;
  minutes: number;
}

/**
 * Parse a time string into minutes
 * Handles formats like: "23:45", "1:23:45", "45m", "1h 30m", "90 minutes", etc.
 */
export function parseTimeString(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const str = timeStr.trim().toLowerCase();
  let totalMinutes = 0;

  // Handle HH:MM:SS or MM:SS format
  const timeMatch = str.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch) {
    const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
    const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
    let seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
    // Always round seconds to nearest integer before converting to minutes
    seconds = Math.round(seconds);
    totalMinutes = hours * 60 + minutes + (seconds / 60);
    return totalMinutes;
  }

  // Handle hour patterns (1h, 2hr, 3 hours, etc.)
  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }

  // Handle minute patterns (30m, 45min, 60 minutes, etc.)
  const minuteMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)(?!\w)/);
  if (minuteMatch) {
    totalMinutes += parseFloat(minuteMatch[1]);
  }

  // Handle second patterns (30s, 45sec, 60 seconds, etc.)
  const secondMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)(?!\w)/);
  if (secondMatch) {
    totalMinutes += parseFloat(secondMatch[1]) / 60;
  }

  // If no patterns matched but we have a number, assume it's minutes
  if (totalMinutes === 0) {
    const numberMatch = str.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      totalMinutes = parseFloat(numberMatch[1]);
    }
  }

  return totalMinutes;
}

/**
 * Parse a list of video entries from text - improved for table/column data
 * Handles various formats and extracts episode names and durations
 */
export function parseVideoList(text: string): Duration[] {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n').filter(line => line.trim());
  const durations: Duration[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip header lines or lines that don't contain duration info
    if (trimmed.toLowerCase().includes('name') || 
        trimmed.toLowerCase().includes('status') || 
        trimmed.toLowerCase().includes('duration') ||
        trimmed.toLowerCase().includes('header')) {
      continue;
    }

    // For table data, look for time patterns (prioritize rightmost column)
    const timePattern = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
    const timeMatches = Array.from(trimmed.matchAll(timePattern));
    
    let episodeName = '';
    let timeStr = '';
    
    if (timeMatches.length > 0) {
      // Use the last (rightmost) time match for duration
      const lastTimeMatch = timeMatches[timeMatches.length - 1];
      timeStr = lastTimeMatch[0];
      
      // Extract episode name from the beginning of the line
      const beforeTime = trimmed.substring(0, lastTimeMatch.index);
      
      // Clean up episode name - take first part before too many separators
      const nameParts = beforeTime.split(/[\t\s]{2,}|[|•]/);
      episodeName = nameParts[0]?.trim() || `Entry ${durations.length + 1}`;
      
      // Remove common prefixes/suffixes from episode name
      episodeName = episodeName.replace(/^(ep|episode|item)\s*/i, '').trim();
    } else {
      // Fallback to original parsing logic for other formats
      let match = trimmed.match(/^(.+?)\s*[-–—]\s*(.+)$/);
      if (match) {
        episodeName = match[1].trim();
        timeStr = match[2].trim();
      }

      if (!match) {
        match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          episodeName = match[1].trim();
          timeStr = match[2].trim();
        }
      }

      if (!match) {
        match = trimmed.match(/^(.+?):\s*(.+)$/);
        if (match) {
          episodeName = match[1].trim();
          timeStr = match[2].trim();
        }
      }

      if (!match) {
        match = trimmed.match(/^(.+?)\s+(\d+[:\dhms\s]+.*)$/);
        if (match) {
          episodeName = match[1].trim();
          timeStr = match[2].trim();
        }
      }

      if (!match) {
        const timePatternFallback = /(\d+(?::\d+){1,2}|\d+\s*(?:h|hr|hrs|hour|hours)\s*\d*\s*(?:m|min|mins|minute|minutes)?|\d+\s*(?:m|min|mins|minute|minutes))/i;
        const timeMatch = trimmed.match(timePatternFallback);
        if (timeMatch) {
          timeStr = timeMatch[0];
          episodeName = trimmed.replace(timeMatch[0], '').trim();
          episodeName = episodeName.replace(/^[-–—:()[\]]+|[-–—:()[\]]+$/g, '').trim();
        }
      }
    }

    // Parse the time and create duration entry
    if (episodeName && timeStr) {
      const minutes = parseTimeString(timeStr);
      if (minutes > 0) {
        durations.push({
          episode: episodeName || `Entry ${durations.length + 1}`,
          minutes
        });
      }
    }
  }

  return durations;
}

/**
 * Format total minutes into a readable time string (minutes and seconds only)
 */
export function formatTotalTime(totalMinutes: number): string {
  return `${totalMinutes.toFixed(2)} minutes`;
}

/**
 * Format total minutes into a readable time string (X minutes and Y seconds)
 */
export function formatToMinutesAndSeconds(totalMinutes: number): string {
  const finalMinutes = Math.floor(totalMinutes);
  const finalSeconds = Math.round((totalMinutes - finalMinutes) * 60);
  return `${finalMinutes} minutes and ${finalSeconds} seconds`;
}


/**
 * Calculate time difference between two time inputs
 */
export function calculateTimeDifference(time1: string, time2: string): number {
  const minutes1 = parseTimeString(time1);
  const minutes2 = parseTimeString(time2);
  return Math.abs(minutes2 - minutes1);
}

/**
 * Add two time inputs together
 */
export function addTimes(time1: string, time2: string): number {
  const minutes1 = parseTimeString(time1);
  const minutes2 = parseTimeString(time2);
  return minutes1 + minutes2;
}
