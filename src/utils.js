/**
 * Builds a greeting message for the given name.
 * @param {string} name - The name to greet.
 * @returns {string} The greeting message.
 */
export function buildGreeting(name) {
  if (!name || name.trim() === "") {
    return "Hello, World!";
  }
  return `Hello, ${name.trim()}!`;
}

/**
 * Formats a timestamp as an ISO 8601 string.
 * @param {Date} [date] - The date to format. Defaults to now.
 * @returns {string} The formatted timestamp.
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}
