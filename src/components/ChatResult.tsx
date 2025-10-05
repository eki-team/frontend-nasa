import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ExternalLink, FileText, Sparkles, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatResponse } from "@/lib/api-rag";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface ChatResultProps {
  response: ChatResponse;
}

export const ChatResult = ({ response }: ChatResultProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implementar text-to-speech
    console.log("Play audio clicked");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Answer Card */}
      <Card className="p-8 glass-card border-border/50 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm border border-border/50">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t("chat.answer")}
              </h3>
              {/* Audio Play Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayAudio}
                className={`hover:bg-accent/10 transition-all ${
                  isPlaying ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                <span className="ml-2 text-sm">
                  {isPlaying ? t("chat.playing") : t("chat.listen")}
                </span>
              </Button>
            </div>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {response.answer}
            </p>
          </div>
        </div>

        {/* Metrics */}
        {response.metrics && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/50">
                {t("chat.retrieved")}: {response.metrics.retrieved_k}
              </Badge>
              <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/50">
                {t("chat.latency")}: {response.metrics.latency_ms.toFixed(0)}ms
              </Badge>
              <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/50">
                {t("chat.grounded")}: {(response.metrics.grounded_ratio * 100).toFixed(1)}%
              </Badge>
              {response.metrics.dedup_count !== undefined && response.metrics.dedup_count > 0 && (
                <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                  Deduped: {response.metrics.dedup_count}
                </Badge>
              )}
            </div>
            
            {/* Section Distribution */}
            {response.metrics.section_distribution && Object.keys(response.metrics.section_distribution).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-2">Section Distribution:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(response.metrics.section_distribution).map(([section, count]) => (
                    <Badge 
                      key={section} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary border-primary/20 text-xs"
                    >
                      {section}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Citations */}
      {response.citations && response.citations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold flex items-center gap-2 px-2">
            <FileText className="h-5 w-5 text-accent" />
            {t("chat.citations")} ({response.citations.length})
          </h4>
          
          <div className="grid gap-3">
            {response.citations.map((citation, index) => {
              // Extraer el título desde metadata.article_metadata o usar fallback
              const articleMetadata = (citation as any).metadata?.article_metadata;
              const title = articleMetadata?.title || citation.title || `Source ${citation.source_id}`;
              const authors = articleMetadata?.authors || [];
              
              // Usar publication_year prioritariamente, luego year como fallback
              const publicationYear = citation.publication_year || citation.year;
              
              return (
                <motion.div
                  key={citation.source_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 glass-card-light border-border/50 hover:bg-accent/10 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {title}
                          </h5>
                          {publicationYear && (
                            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 flex-shrink-0">
                              {publicationYear}
                            </Badge>
                          )}
                        </div>

                        {/* Mostrar autores si están disponibles */}
                        {authors.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {authors.slice(0, 3).join(", ")}
                            {authors.length > 3 && ` +${authors.length - 3} more`}
                          </p>
                        )}

                        {citation.snippet && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {citation.snippet}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {citation.section && (
                            <Badge variant="secondary" className="bg-background/50 text-muted-foreground border-border/50">
                              {citation.section}
                            </Badge>
                          )}
                          {citation.osdr_id && (
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                              {citation.osdr_id}
                            </Badge>
                          )}
                          {citation.organism && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                              {citation.organism}
                            </Badge>
                          )}
                          {citation.doi && (
                            <span className="text-muted-foreground">DOI: {citation.doi}</span>
                          )}
                        </div>

                        {/* Scoring Information (nuevos campos) */}
                        {(citation.similarity_score !== undefined || citation.relevance_reason) && (
                          <div className="mt-2 pt-2 border-t border-border/20">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {citation.similarity_score !== undefined && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
                                  Similarity: {(citation.similarity_score * 100).toFixed(1)}%
                                </Badge>
                              )}
                              {citation.section_boost !== undefined && citation.section_boost > 0 && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30">
                                  +{(citation.section_boost * 100).toFixed(1)}% boost
                                </Badge>
                              )}
                              {citation.final_score !== undefined && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                  Final: {(citation.final_score * 100).toFixed(1)}%
                                </Badge>
                              )}
                            </div>
                            {citation.relevance_reason && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {citation.relevance_reason}
                              </p>
                            )}
                          </div>
                        )}

                        {citation.url && (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t("chat.viewSource")}
                          </a>
                        )}
                    </div>
                  </div>
                </Card>
              </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
