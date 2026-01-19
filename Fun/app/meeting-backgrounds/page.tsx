import { ImageGallery } from '../components/image-gallery'
import { ImageCount } from 'app/components/image-count'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meeting Backgrounds',
  description: 'Professional virtual backgrounds for your video calls and meetings. Download high-quality backgrounds for free.',
  keywords: ['meeting backgrounds', 'virtual backgrounds', 'video call backgrounds', 'professional backgrounds'],
}

export default function MeetingBackgroundsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Meeting Backgrounds
        </h1>
        <p className="text-lg text-neutral-600 mb-2">
          Professional virtual backgrounds for your video calls
        </p>
        <p className="text-neutral-600">
          Click the download button below any image to save the high-resolution version to your device.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            Available Backgrounds
          </h2>
          <ImageCount />
        </div>
      </div>

      <ImageGallery />

      <div className="mt-12 p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          How to use these backgrounds
        </h3>
        <ul className="text-neutral-600 space-y-1 text-sm">
          <li>• Download the background image by clicking the download button</li>
          <li>• In your video call app (Zoom, Teams, etc.), go to video settings</li>
          <li>• Select "Virtual Background" or "Background Effects"</li>
          <li>• Upload the downloaded image as your custom background</li>
        </ul>
      </div>
    </div>
  )
}
