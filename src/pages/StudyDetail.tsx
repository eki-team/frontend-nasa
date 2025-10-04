import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Rocket, FlaskConical, Tag, FileText } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Card } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Separator } from "@/components/UI/separator";
import { Skeleton } from "@/components/UI/skeleton";
import { StudyCard } from "@/components/Results/StudyCard";
import { ErrorState } from "@/components/UI/ErrorState";
import { getStudyById } from "@/lib/api";

const StudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: study, isLoading, error } = useQuery({
    queryKey: ["study", id],
    queryFn: () => getStudyById(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !study) {
    return <ErrorState message={error?.message} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Link to="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("study.backToDashboard")}
        </Button>
      </Link>

      {/* Study Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{study.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{study.year}</span>
          </div>
          
          {study.mission && (
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              <span>{study.mission}</span>
            </div>
          )}
          
          {study.species && (
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              <span>{Array.isArray(study.species) ? study.species.join(", ") : study.species}</span>
            </div>
          )}
        </div>

        {/* Outcomes */}
        {study.outcomes && study.outcomes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {study.outcomes.map((outcome) => (
              <Badge key={outcome} variant="secondary">
                {outcome}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {study.summary && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("study.summary")}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{study.summary}</p>
        </Card>
      )}

      {/* Abstract */}
      {study.abstract && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Abstract</h2>
          <p className="text-muted-foreground leading-relaxed">{study.abstract}</p>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t("study.details")}</h2>
        
        <div className="space-y-4">
          {study.authors && study.authors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t("study.authors")}
              </h3>
              <p className="text-sm">{study.authors.join(", ")}</p>
            </div>
          )}

          {study.keywords && study.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t("study.keywords")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {study.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {study.doi && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">DOI</h3>
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {study.doi}
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Related Publications */}
      {study.related && study.related.length > 0 && (
        <div className="space-y-4">
          <Separator />
          
          <h2 className="text-2xl font-semibold">{t("study.related")}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {study.related.slice(0, 4).map((relatedStudy) => (
              <StudyCard key={relatedStudy.id} study={relatedStudy} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDetail;
