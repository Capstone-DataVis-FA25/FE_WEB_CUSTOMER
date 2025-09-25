import moment from 'moment-timezone';

export default class Utils {
  static getDate(
    timestamp: string | number | Date | null,
    type = 1,
    timezone = 'Asia/Ho_Chi_Minh'
  ) {
    if (timestamp === null) {
      return '';
    }
    let result = null;
    switch (type) {
      case 1:
        result = moment.tz(timestamp, timezone).format('DD/MM/YYYY');
        break;
      case 2:
        result = moment.tz(timestamp, timezone).format('DD.MM.yyyy - HH:mm');
        break;
      case 3:
        result = moment.tz(timestamp, timezone).format('yyyy-MM-DD');
        break;
      case 4:
        result = moment.tz(timestamp, timezone).format('HH:mm:ss - DD.MM.yyyy');
        break;
      case 5:
        result = moment.tz(timestamp, timezone).format('DD.MM.yyyy - HH:mm');
        break;
      case 6:
        result = moment.tz(timestamp, timezone).format('HH:mm');
        break;
      case 7:
        result = moment.tz(timestamp, timezone).format('HH:mm:ss');
        break;
      case 8:
        result = moment.tz(timestamp, timezone).format('DD/MM');
        break;
      case 9:
        result = moment.tz(timestamp, timezone).format('DD/MM/YYYY');
        break;
      case 10:
        result = moment.tz(timestamp, timezone).format('YYYY-MM-DDTHH:mm:ss.ssss');
        break;
      case 11:
        result = moment.tz(timestamp, timezone).format('HH:mm');
        break;
      case 12:
        result = moment.tz(timestamp, timezone).format('HHmm');
        break;
      case 13:
        result = moment.tz(timestamp, timezone).format('Month d yyyy');
        break;
      case 14:
        result = moment.tz(timestamp, timezone).format('YYYY-MM-DD');
        break;
      case 15:
        result = moment.tz(timestamp, timezone).format('MM/YYYY');
        break;
      case 16:
        result = moment.tz(timestamp, timezone).format('DD');
        break;
      case 17:
        result = moment.tz(timestamp, timezone).format('YYYY/MM/DD');
        break;
      case 18:
        result = moment.tz(timestamp, timezone).format('HH:mm DD/MM/YYYY');
        break;
      default:
        result = '';
        break;
    }
    return result;
  }

  static getFormattedMessageTime = (timestamp: string | number | Date | null) => {
    if (!timestamp) return '';

    const timezone = 'Asia/Ho_Chi_Minh';
    const now = moment.tz(timezone).startOf('day');
    const date = moment.tz(timestamp, timezone).startOf('day');

    const isToday = date.isSame(now);

    return Utils.getDate(timestamp, isToday ? 11 : 18, timezone);
  };
}

export const cloudName = 'dnel8ng9g';

export const defaultColorsChart: Record<string, { light: string; dark: string }> = {
  color1: { light: '#3b82f6', dark: '#60a5fa' },
  color2: { light: '#f97316', dark: '#fb923c' },
  color3: { light: '#f59e0b', dark: '#fbbf24' },
  color4: { light: '#eab308', dark: '#facc15' },
  color5: { light: '#ef4444', dark: '#f87171' },
  color6: { light: '#10b981', dark: '#34d399' },
  color7: { light: '#8b5cf6', dark: '#a78bfa' },
  color8: { light: '#6b7280', dark: '#9ca3af' },
};
