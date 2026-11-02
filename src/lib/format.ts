export const formatCount = (n: number): string => n.toLocaleString('en-IN');
export const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/** "LinkedIn Jobs, Naukri, Indeed +4" */
export const joinNames = (names: readonly string[], show = 3): string =>
  names.slice(0, show).join(', ') + (names.length > show ? ` +${names.length - show}` : '');
