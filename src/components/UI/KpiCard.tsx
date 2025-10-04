import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/UI/card";
import { Skeleton } from "@/components/UI/skeleton";

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
      <Card className="p-6">
        <Skeleton className="h-12 w-12 rounded-lg mb-4" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          
          <motion.p 
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
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
