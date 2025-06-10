import useSWR, { SWRConfiguration } from 'swr'
import { useState } from 'react'

interface APIError {
  message: string
  details?: string
}

interface UseAPIOptions<T> extends SWRConfiguration<T> {
  onError?: (error: APIError) => void
  onSuccess?: (data: T) => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'An error occurred')
  }
  return response.json()
}

export function useAPI<T>(
  url: string | null,
  options: UseAPIOptions<T> = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, mutate, ...rest } = useSWR<T>(
    url,
    fetcher,
    {
      onError: (err) => {
        console.error('API Error:', err)
        options.onError?.(err)
      },
      onSuccess: (data) => {
        options.onSuccess?.(data)
      },
      ...options
    }
  )

  const submit = async (
    method: string,
    body?: any
  ): Promise<T | undefined> => {
    try {
      setIsSubmitting(true)
      const response = await fetch(url!, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'An error occurred')
      }

      const result = await response.json()
      await mutate(result, false)
      return result
    } catch (error) {
      console.error('Submit error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    data,
    error,
    isLoading: !error && !data,
    isSubmitting,
    mutate,
    submit,
    ...rest
  }
} 