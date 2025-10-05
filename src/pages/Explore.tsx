import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  listDocumentsPaginated, 
  searchDocuments, 
  getFilterValues,
  searchDocumentsByCategory,
  searchDocumentsByTags,
  type Document,
  type FilterValues 
} from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export const Explore = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  // Cargar valores de filtros al inicio
  useEffect(() => {
    const loadFilterValues = async () => {
      try {
        const values = await getFilterValues();
        setFilterValues(values);
      } catch (err) {
        console.error("Error loading filter values:", err);
      }
    };
    loadFilterValues();
  }, []);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let response;
        
        // Si hay búsqueda por texto, usar search
        if (searchQuery.trim()) {
          const skip = (currentPage - 1) * pageSize;
          response = await searchDocuments(searchQuery, skip, pageSize);
        } 
        // Si hay filtro por tag
        else if (selectedTag) {
          const skip = (currentPage - 1) * pageSize;
          response = await searchDocumentsByTags([selectedTag], false, skip, pageSize);
        }
        // Si hay filtro por categoría
        else if (selectedCategory) {
          const skip = (currentPage - 1) * pageSize;
          response = await searchDocumentsByCategory(selectedCategory, skip, pageSize);
        }
        // Sin filtros, usar paginación mejorada
        else {
          response = await listDocumentsPaginated(currentPage, pageSize);
        }

        setDocuments(response.documents);
        setTotal(response.total);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, searchQuery, selectedCategory, selectedTag]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
    // Clear filters when searching
    setSelectedCategory("");
    setSelectedTag("");
  };

  // Handle category filter
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value);
    setCurrentPage(1);
    // Clear search and tag when filtering by category
    setSearchQuery("");
    setSelectedTag("");
  };

  // Handle tag filter
  const handleTagChange = (value: string) => {
    setSelectedTag(value === "all" ? "" : value);
    setCurrentPage(1);
    // Clear search and category when filtering by tag
    setSearchQuery("");
    setSelectedCategory("");
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {t("explore.title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("explore.subtitle")}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("explore.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg glass-input"
            />
          </div>
        </div>

        {/* Filters */}
        {filterValues && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px] glass-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterValues.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={selectedTag || "all"} onValueChange={handleTagChange}>
              <SelectTrigger className="w-[180px] glass-input">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {filterValues.tags.slice(0, 20).map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(selectedCategory || selectedTag || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedTag("");
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>
              {t("explore.totalDocuments")}: <strong className="text-foreground">{total}</strong>
            </span>
          </div>
          {!isLoading && documents.length > 0 && (
            <span>
              {t("explore.showing")} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, total)} {t("explore.of")} {total}
            </span>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <ErrorState
          message={error}
          onRetry={() => setCurrentPage(1)}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 glass-card animate-pulse">
              <div className="h-6 bg-muted rounded mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          message={searchQuery 
            ? t("explore.tryAdjusting") 
            : selectedCategory 
            ? `No documents found in category: ${selectedCategory}` 
            : selectedTag
            ? `No documents found with tag: ${selectedTag}`
            : t("explore.tryAdjusting")
          }
        />
      )}

      {/* Documents Grid */}
      {!isLoading && !error && documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {documents.map((doc, index) => (
            <motion.div
              key={doc.pk}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/study/${doc.pk}`}>
                <Card className="p-6 glass-card hover:glass-card-hover transition-all h-full flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {doc.article_metadata?.title || doc.title}
                  </h3>

                  {/* Authors */}
                  {doc.article_metadata?.authors && doc.article_metadata.authors.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {doc.article_metadata.authors.slice(0, 3).join(", ")}
                      {doc.article_metadata.authors.length > 3 &&
                        ` +${doc.article_metadata.authors.length - 3} more`}
                    </p>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doc.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-accent/20 text-accent border-accent/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{doc.category}</span>
                    {doc.article_metadata?.pmc_id && (
                      <span className="font-mono">{doc.article_metadata.pmc_id}</span>
                    )}
                  </div>

                  {/* Statistics */}
                  {doc.article_metadata?.statistics && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
                      {doc.article_metadata.statistics.word_count && (
                        <span>{doc.article_metadata.statistics.word_count.toLocaleString()} words</span>
                      )}
                      {doc.article_metadata.statistics.sections && (
                        <span>{doc.article_metadata.statistics.sections} sections</span>
                      )}
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="glass-input"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("explore.previous")}
          </Button>

          <div className="flex items-center gap-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  className="glass-input w-10"
                >
                  1
                </Button>
                {currentPage > 4 && <span className="text-muted-foreground">...</span>}
              </>
            )}

            {/* Pages around current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1 ||
                  page === currentPage - 2 ||
                  page === currentPage + 2
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={page === currentPage ? "bg-primary" : "glass-input w-10"}
                >
                  {page}
                </Button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-muted-foreground">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className="glass-input w-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="glass-input"
          >
            {t("explore.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
