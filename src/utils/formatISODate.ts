import { DateTime } from 'luxon';

/**
 * Formats an ISO date to AP style.
 *
 * AP style shortens month names that are longer than 5 characters.
 *
 * AP style follows the format "Month Day, Year".
 *
 * @param date ISO date
 * @returns AP style formatted date
 */
export function formatISODate(
  date: string,
  showWeekday = false,
  showYear = true,
  showTime = false
) {
  const formatted = DateTime.fromISO(date).toFormat(
    `${showWeekday ? `cccc, ` : ``}LLLL dd${showYear ? `, yyyy` : ``}${
      showTime ? ` 'at' h:mm a` : ``
    }`
  );
  const APFormatted = formatted
    .replace('January', 'Jan.')
    .replace('February', 'Feb.')
    .replace('August', 'Aug.')
    .replace('September', 'Sept.')
    .replace('October', 'Oct.')
    .replace('November', 'Nov.')
    .replace('December', 'Dec.')
    .replace('AM', 'a.m.')
    .replace('PM', 'p.m.');
  return APFormatted;
}
