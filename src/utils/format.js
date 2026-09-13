const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function money(n) {
  return 'R' + Number(n).toLocaleString('en-ZA');
}

// daysOfWeek uses JS getDay() numbering (0 = Sunday); list Monday first to match the booking calendar.
export function formatDays(days) {
  if (!days || days.length === 7) return 'Every day';
  return [...days]
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    .map(d => DAY_NAMES[d])
    .join(', ');
}
