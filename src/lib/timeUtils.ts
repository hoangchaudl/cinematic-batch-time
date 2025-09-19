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
    
    totalMinutes = hours * 60 + minutes + (seconds / 60);
    return Math.round(totalMinutes);
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

  return Math.round(totalMinutes);
}

/**
 * Parse a list of video entries from text
 * Handles various formats and extracts episode names and durations
 */
export function parseVideoList(text: string): Duration[] {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n').filter(line => line.trim());
  const durations: Duration[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Try to extract episode name and duration from various formats
    let episodeName = '';
    let timeStr = '';

    // Format: "Episode 1 - 23:45" or "S01E01 - 42:12"
    let match = trimmed.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    if (match) {
      episodeName = match[1].trim();
      timeStr = match[2].trim();
    }

    // Format: "Episode 1 (23:45)" or "S01E01 (42:12)"
    if (!match) {
      match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        episodeName = match[1].trim();
        timeStr = match[2].trim();
      }
    }

    // Format: "Episode 1: 23:45" or "S01E01: 42:12"
    if (!match) {
      match = trimmed.match(/^(.+?):\s*(.+)$/);
      if (match) {
        episodeName = match[1].trim();
        timeStr = match[2].trim();
      }
    }

    // Format: "Episode 1 23:45" (space separated)
    if (!match) {
      match = trimmed.match(/^(.+?)\s+(\d+[:\dhms\s]+.*)$/);
      if (match) {
        episodeName = match[1].trim();
        timeStr = match[2].trim();
      }
    }

    // If we couldn't parse the format, try to extract any time pattern
    if (!match) {
      const timePattern = /(\d+(?::\d+){1,2}|\d+\s*(?:h|hr|hrs|hour|hours)\s*\d*\s*(?:m|min|mins|minute|minutes)?|\d+\s*(?:m|min|mins|minute|minutes))/i;
      const timeMatch = trimmed.match(timePattern);
      if (timeMatch) {
        timeStr = timeMatch[0];
        episodeName = trimmed.replace(timeMatch[0], '').trim();
        // Clean up episode name
        episodeName = episodeName.replace(/^[-–—:()[\]]+|[-–—:()[\]]+$/g, '').trim();
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
 * Format total minutes into a readable time string
 */
export function formatTotalTime(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)}M`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours < 24) {
    return minutes > 0 ? `${hours}H ${minutes}M` : `${hours}H`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  let result = `${days}D`;
  if (remainingHours > 0) result += ` ${remainingHours}H`;
  if (minutes > 0) result += ` ${minutes}M`;

  return result;
}