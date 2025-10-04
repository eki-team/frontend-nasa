import { Calendar, FileText, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Study } from "@/lib/types";

interface StudyCardProps {
  study: Study;
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case "positive":
      return "bg-green-500/20 text-green-300 border-green-400/30";
    case "negative":
      return "bg-red-500/20 text-red-300 border-red-400/30";
    case "mixed":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
    default:
      return "bg-white/10 text-white/80 border-white/20";
  }
};

export const StudyCard = ({ study }: StudyCardProps) => {
  return (
    <Link to={`/study/${study.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="p-6 h-full glass-card-light hover:bg-accent/10 hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden border-border/50">
          {/* Animated background on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
          
          <div className="space-y-4 relative z-10">
            <div>
              <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {study.title}
              </h3>
              
              {study.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {study.summary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-foreground/80">
              <motion.div 
                className="flex items-center gap-1"
                whileHover={{ scale: 1.1 }}
              >
                <Calendar className="h-4 w-4 text-accent" />
                <span>{study.year}</span>
              </motion.div>
              
              {study.mission && (
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.1 }}
                >
                  <FileText className="h-4 w-4 text-purple-400" />
                  <span>{study.mission}</span>
                </motion.div>
              )}
            </div>

            {(study.outcomes || study.keywords) && (
              <div className="flex flex-wrap gap-2">
                {study.outcomes?.slice(0, 2).map((outcome, index) => (
                  <motion.div
                    key={outcome}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge
                      variant="outline"
                      className={getOutcomeColor(outcome)}
                    >
                      {outcome}
                    </Badge>
                  </motion.div>
                ))}
                
                {study.keywords?.slice(0, 2).map((keyword, index) => (
                  <motion.div
                    key={keyword}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (study.outcomes?.length || 0) * 0.1 + index * 0.1 }}
                  >
                    <Badge variant="secondary" className="text-xs bg-white/10 text-pink-300 border-pink-400/30">
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};
