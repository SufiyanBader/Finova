import xss from 'xss';

const xssOptions = {
  whiteList: {}, // empty whitelist means strip all tags
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style']
};

// Strip HTML and dangerous characters from user input securely
export function sanitizeString(input) {
  if (typeof input !== "string") return input;
  const sanitized = xss(input, xssOptions);
  return sanitized.trim().slice(0, 1000);
}

// Sanitize a whole form data object
export function sanitizeFormData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Validate that an amount is a safe number
export function validateAmount(amount) {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return false;
  if (parsed < 0) return false;
  if (parsed > 1000000000) return false;
  return true;
}

// Validate a date is reasonable
export function validateDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const minDate = new Date("1900-01-01");
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return d >= minDate && d <= maxDate;
}
