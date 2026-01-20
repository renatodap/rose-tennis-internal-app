import { Skeleton } from '@/components/ui/skeleton'

export default function MainLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-12 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
