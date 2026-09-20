import { FeaturedCarousel } from './FeaturedCarousel'
import { CategoryCards } from './CategoryCards'

export function MainContent() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 lg:p-10 pb-32">
      <div className="flex flex-col gap-12 w-full max-w-[1600px] mx-auto">
        <FeaturedCarousel />
        <CategoryCards />
      </div>
    </main>
  )
}
