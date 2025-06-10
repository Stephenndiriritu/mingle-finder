import { LoadingSpinner } from './loading-spinner'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'min-h-screen'
    : 'min-h-[200px]'

  return (
    <div className={`flex items-center justify-center ${containerClasses}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
} 