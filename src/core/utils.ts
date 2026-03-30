/**
 * Converts a Google Drive share link to a direct image link.
 * Supports various formats like /file/d/ID/view, /open?id=ID, etc.
 */
export const getGoogleDriveDirectLink = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) return url;

  let fileId = '';
  
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  } else {
    // Format: https://drive.google.com/open?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    // Return the direct link format
    return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
  }

  return url;
};

/**
 * Ensures a URL is valid and has a protocol.
 */
export const ensureProtocol = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

/**
 * Converts a regular YouTube link to an embed link.
 */
export const getYoutubeEmbedLink = (url: string): string => {
  if (!url) return '';
  
  // If it's already an embed link, return it
  if (url.includes('youtube.com/embed/')) return url;
  
  let videoId = '';
  
  try {
    // Handle various formats
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    if (urlObj.hostname.includes('youtu.be')) {
      // Format: https://youtu.be/VIDEO_ID
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.includes('/watch')) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.pathname.includes('/shorts/')) {
        // Format: https://www.youtube.com/shorts/VIDEO_ID
        videoId = urlObj.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      } else if (urlObj.pathname.includes('/live/')) {
        // Format: https://www.youtube.com/live/VIDEO_ID
        videoId = urlObj.pathname.split('/live/')[1]?.split('/')[0] || '';
      } else if (urlObj.pathname.includes('/v/')) {
        // Format: https://www.youtube.com/v/VIDEO_ID
        videoId = urlObj.pathname.split('/v/')[1]?.split('/')[0] || '';
      }
    }
  } catch (e) {
    // Fallback to regex if URL parsing fails
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    } else {
      const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      }
    }
  }
  
  if (videoId) {
    // Strip any extra parameters from videoId
    const cleanId = videoId.split(/[?&]/)[0];
    // Ensure we don't have a leading slash if it came from pathname
    const finalId = cleanId.startsWith('/') ? cleanId.slice(1) : cleanId;
    return `https://www.youtube.com/embed/${finalId}`;
  }
  
  return url;
};

/**
 * Safely formats a date string or number to a local date string.
 */
export const formatDate = (date: any, locale: string = 'vi-VN'): string => {
  if (!date) return '---';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '---';
    return d.toLocaleDateString(locale);
  } catch (e) {
    return '---';
  }
};

/**
 * Safely formats a date string or number to a local date and time string.
 */
export const formatDateTime = (date: any, locale: string = 'vi-VN'): string => {
  if (!date) return '---';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '---';
    return d.toLocaleString(locale);
  } catch (e) {
    return '---';
  }
};

/**
 * Safely converts a date to an ISO date string (YYYY-MM-DD).
 */
export const toISODateString = (date: any): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

/**
 * Safely ensures a value is an array.
 * If it's a string, it tries to parse it as JSON or splits by comma.
 */
export const ensureArray = <T>(value: any): T[] => {
  if (!value) return [];
  
  let result: any[] = [];
  if (Array.isArray(value)) {
    result = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    // Try to parse as JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          result = parsed;
        } else {
          result = [trimmed];
        }
      } catch (e) {
        // Fallback to comma-separated string if JSON parse fails
        result = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (trimmed) {
      // Fallback to comma-separated string
      result = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
  } else {
    result = [value];
  }
  
  // Normalize elements: trim strings and convert numbers to strings for ID consistency
  return result.map(item => {
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'number') return String(item);
    return item;
  }) as unknown as T[];
};
