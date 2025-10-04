import { motion } from "framer-motion";
import { StudyCard } from "./StudyCard";
import { Study } from "@/lib/types";
import { Skeleton } from "@/components/UI/skeleton";

interface StudiesGridProps {
  studies: Study[];
  isLoading?: boolean;
}

const StudyCardSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 space-y-4 border rounded-lg"
  >
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  </motion.div>
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
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {studies.map((study, index) => (
        <motion.div
          key={study.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <StudyCard study={study} />
        </motion.div>
      ))}
    </motion.div>
  );
};
