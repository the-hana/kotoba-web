export const toErrorMessage = (error: string | string[]): string =>
  typeof error === 'string' ? error : error.join(', ')
