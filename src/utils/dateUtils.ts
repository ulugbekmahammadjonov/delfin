/**
 * Date and Time utilities guaranteeing strict 24-hour format (no AM/PM)
 */

export const formatTime24 = (isoOrDate: string | Date | number | null | undefined): string => {
  if (!isoOrDate) return '';
  // If it's already a clean "HH:mm" string (e.g. "14:30")
  if (typeof isoOrDate === 'string') {
    const trimmed = isoOrDate.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    }
  }
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return String(isoOrDate);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime24 = (isoOrDate: string | Date | number | null | undefined): string => {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return String(isoOrDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};
