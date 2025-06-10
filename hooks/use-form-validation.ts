import { useState } from 'react'
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: unknown) => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path.join('.')] = err.message
          }
        })
        setErrors(formattedErrors)
      }
      return false
    }
  }

  return { errors, validate }
} 