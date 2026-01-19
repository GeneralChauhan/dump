import { BlogPosts } from 'app/components/posts'
import { MeetingBackgroundsCard } from 'app/components/meeting-backgrounds-card'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <MeetingBackgroundsCard />
      </div>


    </section>
  )
}
