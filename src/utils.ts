/**
 * Builds a greeting message for the given name.
 * @param name - The name to greet.
 * @returns The greeting message.
 */
export function buildGreeting(name: string): string {
  if (!name || name.trim() === "") {
    return "Hello, World!";
  }
  return `Hello, ${name.trim()}!`;
}

/**
 * Formats a timestamp as an ISO 8601 string.
 * @param date - The date to format. Defaults to now.
 * @returns The formatted timestamp.
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
