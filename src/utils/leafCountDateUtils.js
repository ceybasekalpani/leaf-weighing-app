const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// A leaf-count business day runs from 06:00 until 06:00 the following day.
// Keep the API's existing day string and Mon-YYYY month format.
export function getLeafCountDateRules(now = new Date()) {
  const effectiveDate = new Date(now);
  if (now.getHours() < 6) {
    effectiveDate.setDate(effectiveDate.getDate() - 1);
  }

  const date = String(effectiveDate.getDate());
  const month = `${MONTHS[effectiveDate.getMonth()]}-${effectiveDate.getFullYear()}`;
  const nextChange = new Date(now);
  if (now.getHours() < 6) {
    nextChange.setHours(6, 0, 0, 0);
  } else {
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(0, 0, 0, 0);
  }

  return {
    date,
    month,
    nextChangeAt: nextChange.getTime(),
    // Refresh the calendar header at midnight even when the business day stays the same.
    key: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}|${date}-${month}`,
  };
}

export function isLeafCountPeriodAllowed(date, month, rules = getLeafCountDateRules()) {
  return date === rules.date && month === rules.month;
}
