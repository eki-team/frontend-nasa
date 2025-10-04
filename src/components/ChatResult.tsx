import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ExternalLink, FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatResponse } from "@/lib/api-rag";
import { useTranslation } from "react-i18next";

interface ChatResultProps {
  response: ChatResponse;
}

export const ChatResult = ({ response }: ChatResultProps) => {
  const { t } = useTranslation();

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
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("chat.answer")}
            </h3>
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
            </div>
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
            {response.citations.map((citation, index) => (
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
                          {citation.title}
                        </h5>
                        {citation.year && (
                          <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 flex-shrink-0">
                            {citation.year}
                          </Badge>
                        )}
                      </div>

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
                        {citation.doi && (
                          <span className="text-muted-foreground">DOI: {citation.doi}</span>
                        )}
                      </div>

                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t("chat.viewSource")}
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
