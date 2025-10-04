import { StudyCard } from "./StudyCard";
import { Study } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface StudiesGridProps {
  studies: Study[];
  isLoading?: boolean;
}

const StudyCardSkeleton = () => (
  <div className="p-6 space-y-4 border rounded-lg">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export const StudiesGrid = ({ studies, isLoading }: StudiesGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StudyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  );
};
