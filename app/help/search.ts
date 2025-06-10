'use server'

import { getHelpArticles } from '@/lib/api/content'

export async function searchArticles(query: string) {
  return await getHelpArticles(query)
} 