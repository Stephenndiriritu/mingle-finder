import { NextResponse } from "next/server"

export class APIError extends Error {
  status: number
  
  constructor(message: string, status: number = 500) {
    super(message)
    this.status = status
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message }, 
      { status: error.status }
    )
  }
  
  // Database errors
  if (error instanceof Error && error.message.includes('duplicate key')) {
    return NextResponse.json(
      { error: 'A record with this information already exists' },
      { status: 409 }
    )
  }
  
  // Generic error handling
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

export function validateRequestBody<T>(
  body: unknown, 
  validator: (data: unknown) => { success: boolean; data?: T; error?: any }
): T {
  const result = validator(body)
  
  if (!result.success) {
    throw new APIError('Invalid request data', 400)
  }
  
  return result.data as T
}
