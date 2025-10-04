import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
}

export const KpiCard = ({ title, value, icon: Icon, isLoading }: KpiCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;

  useEffect(() => {
    if (typeof value === "number" && !isLoading) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, numericValue, isLoading]);

  if (isLoading) {
    return (
      <Card className="p-6 glass-card-light">
        <Skeleton className="h-12 w-12 rounded-lg mb-4 bg-white/20" />
        <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
        <Skeleton className="h-8 w-16 bg-white/20" />
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="p-6 glass-card-light hover:bg-accent/10 transition-all group relative overflow-hidden shadow-lg hover:shadow-2xl border-border/50">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm border border-border/50 shadow-lg"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-6 w-6 text-accent drop-shadow-lg" />
            </motion.div>
          </div>
          
          <h3 className="text-sm font-bold text-foreground/90 mb-1 uppercase tracking-wider">
            {title}
          </h3>
          
          <motion.p 
            className="text-3xl font-bold text-foreground drop-shadow-lg tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {typeof value === "number" ? displayValue : value}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  );
};
