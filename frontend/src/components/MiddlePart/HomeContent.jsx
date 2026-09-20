import { FeaturedCarousel } from '../Dashboard/FeaturedCarousel'
import { CategoryCards } from '../Dashboard/CategoryCards'

export default function HomeContent() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-28">
      <FeaturedCarousel />
      <CategoryCards />
    </div>
  )
}