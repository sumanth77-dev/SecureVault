export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Never / None';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const getDaysRemaining = (expiryDateString) => {
  if (!expiryDateString) return null;
  const now = new Date();
  const expiry = new Date(expiryDateString);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDateString) => {
  if (!expiryDateString) return { status: 'valid', label: 'Valid / No Expiry', color: 'emerald', days: null };
  const days = getDaysRemaining(expiryDateString);
  if (days < 0) {
    return { status: 'expired', label: `Expired (${Math.abs(days)}d ago)`, color: 'rose', days };
  }
  if (days <= 45) {
    return { status: 'expiring', label: `Expires in ${days} ${days === 1 ? 'day' : 'days'}`, color: 'amber', days };
  }
  return { status: 'valid', label: `Valid (${formatDate(expiryDateString)})`, color: 'emerald', days };
};

export const formatRemainingCountdown = (expiresAt) => {
  if (!expiresAt) {
    return { formatted: 'Never expires', isExpired: false, totalSeconds: Infinity, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const targetTime = new Date(expiresAt).getTime();
  if (isNaN(targetTime)) {
    return { formatted: '—', isExpired: false, totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diffMs = targetTime - Date.now();
  if (diffMs <= 0) {
    return { formatted: '00:00:00', isExpired: true, totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (days > 0) {
    return {
      formatted: `${days}d ${hh}:${mm}:${ss}`,
      isExpired: false,
      totalSeconds,
      days,
      hours,
      minutes,
      seconds
    };
  }

  return {
    formatted: `${hh}:${mm}:${ss}`,
    isExpired: false,
    totalSeconds,
    days: 0,
    hours,
    minutes,
    seconds
  };
};

export const timeAgo = (dateString) => {
  if (!dateString) return 'recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};
