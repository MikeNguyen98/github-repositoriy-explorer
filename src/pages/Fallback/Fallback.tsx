import { Skeleton } from "@/components/ui/skeleton"

function Fallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-31 w-62 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-62" />
        <Skeleton className="h-4 w-50" />
      </div>
    </div>
  )
}
export default Fallback;
