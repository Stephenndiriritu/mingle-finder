import { Suspense } from 'react'
import { getHelpArticles } from '@/lib/api/content'
import { SearchForm } from './search-form'
import { ArticlesList } from './articles-list'
import { ArticlesSkeleton } from './articles-skeleton'
import { ContactSupport } from './contact-support'

export const revalidate = 3600 // Revalidate every hour

export default async function HelpPage() {
  const initialArticles = await getHelpArticles()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Help Center</h1>
      <div className="max-w-4xl mx-auto">
        <SearchForm />
        
        <Suspense fallback={<ArticlesSkeleton />}>
          <ArticlesList initialArticles={initialArticles} />
        </Suspense>

        <ContactSupport />
      </div>
    </div>
  )
}

function TopicSection({ title, articles }: { title: string; articles: string[] }) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="space-y-3">
        {articles.map((article, index) => (
          <li key={index}>
            <a 
              href="#" 
              className="text-gray-600 hover:text-pink-500 transition-colors flex items-center"
            >
              <span className="mr-2">📄</span>
              {article}
            </a>
          </li>
        ))}
      </ul>
      <button className="mt-4 text-pink-500 hover:text-pink-600 font-semibold">
        View all articles →
      </button>
    </div>
  )
} 