// components/ProductSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"

function Fallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
export default Fallback;
