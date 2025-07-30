import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: 'hospital-list' | 'search-results' | 'card';
  count?: number;
}

export const LoadingSkeleton = ({ type = 'card', count = 3 }: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'hospital-list') {
    return (
      <div className="space-y-4 fade-in">
        {skeletons.map((index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full shimmer" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 shimmer" />
                <Skeleton className="h-3 w-1/2 shimmer" />
              </div>
            </div>
            <Skeleton className="h-3 w-full shimmer" />
            <Skeleton className="h-3 w-2/3 shimmer" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16 shimmer" />
              <Skeleton className="h-6 w-20 shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'search-results') {
    return (
      <div className="grid gap-4 fade-in">
        {skeletons.map((index) => (
          <div key={index} className="p-3 border rounded space-y-2">
            <Skeleton className="h-5 w-4/5 shimmer" />
            <Skeleton className="h-4 w-full shimmer" />
            <Skeleton className="h-4 w-3/4 shimmer" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-1/3 shimmer" />
              <Skeleton className="h-8 w-20 shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      {skeletons.map((index) => (
        <div key={index} className="p-4 space-y-3">
          <Skeleton className="h-6 w-1/2 shimmer" />
          <Skeleton className="h-4 w-full shimmer" />
          <Skeleton className="h-4 w-3/4 shimmer" />
        </div>
      ))}
    </div>
  );
};