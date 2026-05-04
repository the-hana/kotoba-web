import type { JlptLevel } from '@/types'

export const JLPT_LEVELS: JlptLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1']

export const isValidLevel = (l: string | undefined): l is JlptLevel =>
  !!l && (JLPT_LEVELS as string[]).includes(l)
