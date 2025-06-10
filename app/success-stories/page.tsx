import { Suspense } from 'react'
import { getSuccessStories } from '@/lib/api/content'
import { SuccessStorySkeleton } from './loading'
import { TestimonialForm } from '@/components/testimonial-form'

interface SuccessStoryProps {
  names: string
  location: string
  story: string
  image?: string
}

function SuccessStory({ names, location, story, image }: SuccessStoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={`${names} from ${location}`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{names}</h3>
        <p className="text-sm text-gray-500 mb-4">{location}</p>
        <p className="text-gray-700">{story}</p>
      </div>
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour

export default async function SuccessStoriesPage() {
  const stories = await getSuccessStories()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-2">Success Stories</h1>
      <p className="text-center text-gray-600 mb-12">
        Real people, real connections, real love stories from Mingle Finder
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Suspense fallback={<SuccessStorySkeleton count={6} />}>
          {stories.map((story) => (
            <SuccessStory
              key={story.id}
              names={story.names}
              location={story.location}
              story={story.story}
              image={story.image_url}
            />
          ))}
        </Suspense>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <TestimonialForm />
      </div>
    </div>
  )
}
