import Link from 'next/link'
import Image from 'next/image'

export function MeetingBackgroundsCard() {
  return (
    <Link 
      href="/meeting-backgrounds"
      className="block group"
    >
      <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
              Meeting Backgrounds
            </h3>
            <p className="text-neutral-600 mt-1">
              Professional backgrounds for your video calls
            </p>
          </div>
          <div className="text-neutral-400 group-hover:text-neutral-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
