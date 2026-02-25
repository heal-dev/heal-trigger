/**
 * Converts a glob-style pattern to a POSIX regex string compatible with
 * PostgreSQL's case-insensitive regex match operator (`~*`).
 *
 * - Bare values (no `*`) are treated as exact matches and wrapped in `^...$`.
 * - `*` wildcards are converted to `.*`.
 * - All other regex special characters are escaped.
 *
 * @example
 * globToRegex("finance")   // "^finance$"
 * globToRegex("*nance")    // ".*nance"
 * globToRegex("*login*")   // ".*login.*"
 */
export function globToRegex(glob: string): string {
  if (!glob) throw new Error(`Invalid glob pattern: "${glob}"`);
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  if (escaped.includes('*')) {
    return escaped.replace(/\*/g, '.*');
  }
  return `^${escaped}$`;
}
