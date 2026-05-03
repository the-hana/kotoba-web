export const toErrorMessage = (error: string | string[]): string =>
  typeof error === 'string' ? error : error.join(', ')

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
