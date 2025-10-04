import { Calendar, FileText, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Study } from "@/lib/types";

interface StudyCardProps {
  study: Study;
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case "positive":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    case "negative":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "mixed":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const StudyCard = ({ study }: StudyCardProps) => {
  return (
    <Link to={`/study/${study.id}`}>
      <Card className="p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
        <div className="space-y-4">
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

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{study.year}</span>
            </div>
            
            {study.mission && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{study.mission}</span>
              </div>
            )}
          </div>

          {(study.outcomes || study.keywords) && (
            <div className="flex flex-wrap gap-2">
              {study.outcomes?.slice(0, 2).map((outcome) => (
                <Badge
                  key={outcome}
                  variant="outline"
                  className={getOutcomeColor(outcome)}
                >
                  {outcome}
                </Badge>
              ))}
              
              {study.keywords?.slice(0, 2).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
