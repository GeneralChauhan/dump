/**
 * COMMENTED OUT:
 * Not used by `LineChart`. The LineChart formatting/time constants are provided
 * by `@pulse/engine` now (`TIME_FORMATS`).
 *
 * Original implementation preserved below for reference.
 */
// const MONTH_NAMES = [
//   'Jan',
//   'Feb',
//   'Mar',
//   'Apr',
//   'May',
//   'Jun',
//   'Jul',
//   'Aug',
//   'Sep',
//   'Oct',
//   'Nov',
//   'Dec',
// ];
//
// const MONTH_NAMES_FULL = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];
//
// const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
// export function timeFormat(specifier: string): (date: Date) => string {
//   return (date: Date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const day = date.getDate();
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const seconds = date.getSeconds();
//     const dayOfWeek = date.getDay();
//
//     let result = specifier;
//
//     result = result.replace(/%Y/g, String(year));
//     result = result.replace(/%y/g, String(year % 100).padStart(2, '0'));
//
//     result = result.replace(/%B/g, MONTH_NAMES_FULL[month]);
//     result = result.replace(/%b/g, MONTH_NAMES[month]);
//     result = result.replace(/%m/g, String(month + 1).padStart(2, '0'));
//     result = result.replace(/%-m/g, String(month + 1));
//
//     result = result.replace(/%d/g, String(day).padStart(2, '0'));
//     result = result.replace(/%-d/g, String(day));
//     result = result.replace(/%A/g, DAY_NAMES[dayOfWeek]);
//     result = result.replace(/%a/g, DAY_NAMES[dayOfWeek].substring(0, 1));
//
//     result = result.replace(/%H/g, String(hours).padStart(2, '0'));
//     result = result.replace(/%-H/g, String(hours));
//     result = result.replace(/%I/g, String(hours % 12 || 12).padStart(2, '0'));
//     result = result.replace(/%-I/g, String(hours % 12 || 12));
//     result = result.replace(/%M/g, String(minutes).padStart(2, '0'));
//     result = result.replace(/%-M/g, String(minutes));
//     result = result.replace(/%S/g, String(seconds).padStart(2, '0'));
//     result = result.replace(/%-S/g, String(seconds));
//     result = result.replace(/%p/g, hours >= 12 ? 'PM' : 'AM');
//
//     return result;
//   };
// }
//
// export const timeFormats = {
//   '%d %b': timeFormat('%d %b'),
//   '%b %Y': timeFormat('%b %Y'),
//   '%Y': timeFormat('%Y'),
//   '%d %b %Y': timeFormat('%d %b %Y'),
//   '%H:%M': timeFormat('%H:%M'),
//   '%I:%M %p': timeFormat('%I:%M %p'),
// };

export {};
