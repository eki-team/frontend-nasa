import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ForceGraph2D from "react-force-graph-2d";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { getKnowledgeGraph } from "@/lib/api";
import { GraphNode } from "@/lib/types";

const NODE_COLORS = {
  mission: "#3b82f6",
  experiment: "#8b5cf6",
  species: "#10b981",
  outcome: "#f59e0b",
  paper: "#ef4444"
};

const GraphViewer = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const graphRef = useRef<any>();

  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ["graph"],
    queryFn: () => getKnowledgeGraph()
  });

  const filteredData = graphData ? {
    nodes: graphData.nodes.filter(node => 
      (selectedTypes.length === 0 || selectedTypes.includes(node.type)) &&
      (!searchTerm || node.label.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    links: graphData.links.filter(link => {
      const sourceNode = graphData.nodes.find(n => n.id === link.source);
      const targetNode = graphData.nodes.find(n => n.id === link.target);
      return sourceNode && targetNode &&
        (selectedTypes.length === 0 || 
          (selectedTypes.includes(sourceNode.type) && selectedTypes.includes(targetNode.type)));
    })
  } : { nodes: [], links: [] };

  const handleNodeClick = useCallback((node: GraphNode) => {
    const neighbors = new Set();
    const links = new Set();

    graphData?.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any)?.id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any)?.id : link.target;
      
      if (sourceId === node.id) {
        neighbors.add(targetId);
        links.add(link);
      }
      if (targetId === node.id) {
        neighbors.add(sourceId);
        links.add(link);
      }
    });

    setHighlightNodes(neighbors);
    setHighlightLinks(links);
  }, [graphData]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("graph.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("graph.subtitle")}
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search */}
          <div>
            <Label className="mb-2 block">{t("graph.searchNode")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("graph.searchNode")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Label className="mb-2 block flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("graph.filterByType")}
            </Label>
            <div className="flex flex-wrap gap-3">
              {Object.keys(NODE_COLORS).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.length === 0 || selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: NODE_COLORS[type as keyof typeof NODE_COLORS] }}
                    />
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredData.nodes.length} {t("graph.nodes")} • {filteredData.links.length} {t("graph.links")}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedTypes([]);
              setHighlightNodes(new Set());
              setHighlightLinks(new Set());
            }}
          >
            Reset View
          </Button>
        </div>
      </Card>

      {/* Graph Canvas */}
      <Card className="p-0 overflow-hidden" style={{ height: "600px" }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">{t("common.loading")}</div>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            nodeLabel="label"
            nodeColor={(node: any) => NODE_COLORS[node.type as keyof typeof NODE_COLORS] || "#888"}
            nodeRelSize={6}
            linkColor={() => "rgba(100, 100, 100, 0.2)"}
            linkWidth={(link: any) => (highlightLinks.has(link) ? 3 : 1)}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              const isHighlight = highlightNodes.has(node.id);
              ctx.fillStyle = isHighlight 
                ? NODE_COLORS[node.type as keyof typeof NODE_COLORS]
                : NODE_COLORS[node.type as keyof typeof NODE_COLORS] + "aa";
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, isHighlight ? 8 : 5, 0, 2 * Math.PI);
              ctx.fill();
              
              if (globalScale > 1.5) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillText(label, node.x, node.y + 15);
              }
            }}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            onEngineStop={() => graphRef.current?.zoomToFit(400)}
          />
        )}
      </Card>

      {/* Legend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("graph.legend")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GraphViewer;
