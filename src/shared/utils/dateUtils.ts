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

/**
 * Ish vaqtini hisoblash (Kelish, Ketish va Ishdan tashqari soat)
 * Tun smenasini (masalan: 20:00 dan 04:00 gacha) ham to'g'ri qo'llab-quvvatlaydi.
 */
export const calculateShiftHours = (
  checkIn: string,
  checkOut: string,
  breakHours: number = 0
): { grossHours: number; netHours: number } => {
  if (!checkIn || !checkOut) return { grossHours: 0, netHours: 0 };
  const [inH, inM] = checkIn.split(':').map((x) => parseInt(x, 10));
  const [outH, outM] = checkOut.split(':').map((x) => parseInt(x, 10));

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return { grossHours: 0, netHours: 0 };
  }

  let startMin = inH * 60 + inM;
  let endMin = outH * 60 + outM;

  if (endMin < startMin) {
    // Tungi smena: 24 soatdan oshib ertasi kunga o'tgan
    endMin += 24 * 60;
  }

  const grossMinutes = Math.max(0, endMin - startMin);
  const grossHours = Math.round((grossMinutes / 60) * 100) / 100;
  const breakNum = Math.max(0, Number(breakHours) || 0);
  const netHours = Math.max(0, Math.round((grossHours - breakNum) * 100) / 100);

  return { grossHours, netHours };
};

export interface ShiftBreakdownResult {
  grossHours: number;
  netHours: number;
  regularHours: number;
  bonusHours: number;
  regularEarned: number;
  bonusEarned: number;
  totalEarned: number;
}

/**
 * Kunduzgi va Tungi bonus soatlarini alohida ajratib hisoblash
 * Masalan: 20:00 dan 06:00 gacha 25 000 so'm, qolgan vaqt 20 000 so'm
 */
export const calculateShiftBreakdown = (
  checkIn: string,
  checkOut: string,
  breakHours: number = 0,
  regularRate: number = 20000,
  bonusConfig?: { enabled: boolean; startTime: string; endTime: string; bonusHourlyRate: number }
): ShiftBreakdownResult => {
  if (!checkIn || !checkOut) {
    return {
      grossHours: 0,
      netHours: 0,
      regularHours: 0,
      bonusHours: 0,
      regularEarned: 0,
      bonusEarned: 0,
      totalEarned: 0,
    };
  }

  const [inH, inM] = checkIn.split(':').map((x) => parseInt(x, 10));
  const [outH, outM] = checkOut.split(':').map((x) => parseInt(x, 10));

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return {
      grossHours: 0,
      netHours: 0,
      regularHours: 0,
      bonusHours: 0,
      regularEarned: 0,
      bonusEarned: 0,
      totalEarned: 0,
    };
  }

  let startMin = inH * 60 + inM;
  let endMin = outH * 60 + outM;
  if (endMin < startMin) {
    endMin += 24 * 60;
  }

  const grossMinutes = Math.max(0, endMin - startMin);
  const grossHours = Math.round((grossMinutes / 60) * 100) / 100;
  const breakNum = Math.max(0, Number(breakHours) || 0);

  if (!bonusConfig || !bonusConfig.enabled) {
    const netHours = Math.max(0, Math.round((grossHours - breakNum) * 100) / 100);
    const earned = Math.round(netHours * regularRate);
    return {
      grossHours,
      netHours,
      regularHours: netHours,
      bonusHours: 0,
      regularEarned: earned,
      bonusEarned: 0,
      totalEarned: earned,
    };
  }

  const [bStartH, bStartM] = (bonusConfig.startTime || '20:00').split(':').map((x) => parseInt(x, 10));
  const [bEndH, bEndM] = (bonusConfig.endTime || '06:00').split(':').map((x) => parseInt(x, 10));
  const bStartMin = (isNaN(bStartH) ? 20 : bStartH) * 60 + (isNaN(bStartM) ? 0 : bStartM);
  const bEndMin = (isNaN(bEndH) ? 6 : bEndH) * 60 + (isNaN(bEndM) ? 0 : bEndM);

  const isBonusMinute = (m: number): boolean => {
    const mod = m % (24 * 60);
    if (bStartMin > bEndMin) {
      return mod >= bStartMin || mod < bEndMin;
    } else {
      return mod >= bStartMin && mod < bEndMin;
    }
  };

  let bonusMins = 0;
  let regularMins = 0;
  for (let m = startMin; m < endMin; m++) {
    if (isBonusMinute(m)) {
      bonusMins++;
    } else {
      regularMins++;
    }
  }

  const totalMins = bonusMins + regularMins;
  const breakMins = breakNum * 60;
  let netRegMins = regularMins;
  let netBonMins = bonusMins;

  if (totalMins > 0 && breakMins > 0) {
    const regRatio = regularMins / totalMins;
    const bonRatio = bonusMins / totalMins;
    netRegMins = Math.max(0, regularMins - breakMins * regRatio);
    netBonMins = Math.max(0, bonusMins - breakMins * bonRatio);
  }

  const regularHours = Math.round((netRegMins / 60) * 100) / 100;
  const bonusHours = Math.round((netBonMins / 60) * 100) / 100;
  const netHours = Math.round((regularHours + bonusHours) * 100) / 100;

  const regularEarned = Math.round(regularHours * regularRate);
  const bonusEarned = Math.round(bonusHours * (bonusConfig.bonusHourlyRate || regularRate));
  const totalEarned = regularEarned + bonusEarned;

  return {
    grossHours,
    netHours,
    regularHours,
    bonusHours,
    regularEarned,
    bonusEarned,
    totalEarned,
  };
};

/**
 * Valyutani chiroyli formatlash (masalan: 200000 -> 200 000 so'm)
 */
export const formatSum = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const getCurrentDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
