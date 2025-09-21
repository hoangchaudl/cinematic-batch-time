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
  const totalSeconds = Math.round(totalMinutes * 60);
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
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
    // Always round seconds to nearest integer before converting to minutes
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

  let fallbackCounter = 1;
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

    // For table data, build a list of time pattern candidates (colon times, textual durations, etc.)
    const timeCandidates: Array<{ value: string; index: number; priority: number }> = [];

    const colonPattern = /(\d{1,2}:\d{2}(?::\d{2})?)(?!\s*[AaPp][Mm])/g;
    for (const match of trimmed.matchAll(colonPattern)) {
      if (typeof match.index === 'number') {
        timeCandidates.push({ value: match[0], index: match.index, priority: 2 });
      }
    }

    // Capture textual durations like "3m 19s", "1 hour 2 minutes", etc.
    const unitPattern = /(\d+(?:\.\d+)?\s*(?:h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds))/gi;
    const unitMatches = Array.from(trimmed.matchAll(unitPattern));
    for (let i = 0; i < unitMatches.length; i++) {
      const match = unitMatches[i];
      if (typeof match.index !== 'number') continue;
      let combinedValue = match[0];
      const startIndex = match.index;
      let endIndex = startIndex + match[0].length;

      while (i + 1 < unitMatches.length) {
        const nextMatch = unitMatches[i + 1];
        if (typeof nextMatch.index !== 'number') break;
        const between = trimmed.slice(endIndex, nextMatch.index);
        if (!/^[\s,/()*-–—]*(?:and\s+)?$/i.test(between)) break;
        combinedValue += between + nextMatch[0];
        endIndex = nextMatch.index + nextMatch[0].length;
        i++;
      }

      timeCandidates.push({ value: combinedValue.trim(), index: startIndex, priority: 3 });
    }

    let episodeName = '';
    let timeStr = '';
    let episodeNum = '';
    let parsedMinutes = 0;

    if (timeCandidates.length > 0) {
      const sortedCandidates = timeCandidates.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return b.index - a.index;
      });

      let selectedCandidate: { value: string; index: number } | null = null;
      for (const candidate of sortedCandidates) {
        const candidateMinutes = parseTimeString(candidate.value);
        if (candidateMinutes > 0) {
          timeStr = candidate.value;
          parsedMinutes = candidateMinutes;
          selectedCandidate = { value: candidate.value, index: candidate.index };
          break;
        }
      }

      if (selectedCandidate) {
        // Extract episode name from the beginning of the line
        const beforeTime = trimmed.substring(0, selectedCandidate.index);

        const normalizedBeforeTime = beforeTime.replace(/[_.-]+/g, ' ');

        // Try to extract episode number from various patterns
        // Matches: Ep 12, Episode 12, E12, 12, etc.
        const epPrefixMatch = normalizedBeforeTime.match(/(?:^|\b)(?:ep(?:isode)?|e)\s*[#:-]*\s*(\d{1,4})\b/i);
        episodeNum = epPrefixMatch ? epPrefixMatch[1] : '';

        // If still not found, try to find a number at the start of the line
        if (!episodeNum) {
          const startNumMatch = normalizedBeforeTime.match(/^(\d{1,4})\b/);
          episodeNum = startNumMatch ? startNumMatch[1] : '';
        }

        if (!episodeNum) {
          const tokens = normalizedBeforeTime.split(/\s+/);
          for (const token of tokens) {
            if (!token) continue;
            if (/[/:]/.test(token)) continue; // Skip dates or times
            const digits = token.replace(/\D/g, '');
            if (!digits) continue;
            if (digits.length > 4) continue;
            episodeNum = digits;
            break;
          }
        }

        // Clean up episode name - take first part before too many separators
        const nameParts = beforeTime.split(/[\t\s]{2,}|[|•]/);
        episodeName = nameParts[0]?.trim() || `Entry ${durations.length + 1}`;

        // Remove common prefixes/suffixes from episode name
        episodeName = episodeName.replace(/^(ep|episode|item)\s*/i, '').trim();
      }
    }

    if (!timeStr) {
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
      const minutes = parsedMinutes || parseTimeString(timeStr);
      if (minutes > 0) {
        // Fallback: if episodeNum is still empty, use a sequential number
        const finalEpisodeNum = episodeNum || fallbackCounter.toString();
        durations.push({
          episode: finalEpisodeNum,
          minutes
        });
        fallbackCounter++;
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
