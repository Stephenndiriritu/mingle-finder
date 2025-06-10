'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export function SearchForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useDebounce((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, 300)

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8">
      <input
        type="search"
        placeholder="Search help articles..."
        className="w-full p-4 border rounded-md"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('q') ?? ''}
      />
      {isPending && (
        <p className="text-sm text-gray-500 mt-2">Searching...</p>
      )}
    </div>
  )
} 