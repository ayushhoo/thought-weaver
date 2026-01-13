import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { GraphControls } from '@/components/GraphControls';
import { ThoughtReframeDialog } from '@/components/ThoughtReframeDialog';
import { Sparkles, Archive, Layers } from 'lucide-react';
import type { WorryGraph, WorryNode } from '@/types/session';
import { useAccessibility } from '@/hooks/useAccessibility';

interface WorryGraphViewProps {
  graph: WorryGraph;
  onContinue: () => void;
  onGraphUpdate?: (graph: WorryGraph) => void;
}

function WorryNodeComponent({ 
  node, 
  isSelected, 
  onClick,
  isPaused,
  isReframed,
  depth = 'primary'
}: { 
  node: WorryNode; 
  isSelected: boolean;
  onClick: () => void;
  isPaused: boolean;
  isReframed?: boolean;
  depth?: 'primary' | 'secondary' | 'tertiary';
}) {
  const baseDelay = useMemo(() => Math.random() * 2, []);
  
  const sizeClasses = node.isRoot 
    ? 'w-32 h-32 md:w-40 md:h-40' 
    : node.isNoise 
      ? 'w-14 h-14 md:w-18 md:h-18'
      : 'w-20 h-20 md:w-28 md:h-28';

  const colorClasses = isReframed
    ? 'bg-node-reframed text-node-reframed-foreground shadow-glow-success'
    : node.isRoot 
      ? 'bg-node-root text-node-root-foreground shadow-glow' 
      : node.isNoise 
        ? 'bg-node-noise text-node-noise-foreground'
        : 'bg-card text-card-foreground border border-border';

  const depthClasses = node.isNoise ? 'depth-tertiary' : depth === 'secondary' ? 'depth-secondary' : '';
  
  return (
    <button
      className={`
        absolute cursor-pointer transition-all duration-300 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${node.isRoot ? 'z-20' : node.isNoise ? 'z-5' : 'z-10'}
        ${isSelected ? 'scale-110' : 'hover:scale-105'}
        ${!isPaused ? 'animate-node-float' : ''}
        ${isReframed ? 'animate-reframe-glow' : ''}
        ${depthClasses}
      `}
      style={{ 
        left: `${node.x}%`, 
        top: `${node.y}%`,
        animationDelay: `${baseDelay}s`,
      }}
      onClick={onClick}
      aria-label={`${node.isRoot ? 'Root concern: ' : node.isNoise ? 'Noise thought: ' : 'Connected thought: '}${node.text}`}
    >
      <div
        className={`
          rounded-full flex items-center justify-center p-3 transition-all duration-300
          ${sizeClasses}
          ${colorClasses}
          ${isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <span className={`text-center leading-tight ${
          node.isRoot ? 'text-xs md:text-sm font-semibold' : 'text-xs'
        }`}>
          {node.text.length > 25 ? node.text.slice(0, 25) + '...' : node.text}
        </span>
      </div>
    </button>
  );
}

export function WorryGraphView({ graph, onContinue, onGraphUpdate }: WorryGraphViewProps) {
  const [selectedNode, setSelectedNode] = useState<WorryNode | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNoise, setShowNoise] = useState(true);
  const [reframedNodes, setReframedNodes] = useState<Set<string>>(new Set());
  const [archivedNodes, setArchivedNodes] = useState<Set<string>>(new Set());
  const [reframeDialogOpen, setReframeDialogOpen] = useState(false);
  const [history, setHistory] = useState<Array<{ reframed: Set<string>; archived: Set<string> }>>([]);
  
  const { calmMode, toggleCalmMode } = useAccessibility();

  const visibleNodes = useMemo(() => {
    return graph.nodes.filter(node => {
      if (archivedNodes.has(node.id)) return false;
      if (!showNoise && node.isNoise) return false;
      return true;
    });
  }, [graph.nodes, showNoise, archivedNodes]);

  const handleNodeClick = useCallback((node: WorryNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleReframe = useCallback((nodeId: string, newText: string) => {
    setHistory(prev => [...prev, { reframed: new Set(reframedNodes), archived: new Set(archivedNodes) }]);
    setReframedNodes(prev => new Set(prev).add(nodeId));
    setSelectedNode(null);
  }, [reframedNodes, archivedNodes]);

  const handleArchive = useCallback((nodeId: string) => {
    setHistory(prev => [...prev, { reframed: new Set(reframedNodes), archived: new Set(archivedNodes) }]);
    setArchivedNodes(prev => new Set(prev).add(nodeId));
    setSelectedNode(null);
  }, [reframedNodes, archivedNodes]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setReframedNodes(lastState.reframed);
      setArchivedNodes(lastState.archived);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  const handleReset = useCallback(() => {
    setReframedNodes(new Set());
    setArchivedNodes(new Set());
    setSelectedNode(null);
    setHistory([]);
  }, []);

  const rootNode = graph.nodes.find(n => n.isRoot);
  const reframedCount = reframedNodes.size;
  const archivedCount = archivedNodes.size;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in w-full max-w-4xl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Your Worry Graph
        </h2>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Click any thought to explore it. The <span className="text-primary font-medium">highlighted node</span> is your root concern.
        </p>
      </div>

      {/* Controls */}
      <GraphControls
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onUndo={handleUndo}
        onReset={handleReset}
        calmMode={calmMode}
        onToggleCalmMode={toggleCalmMode}
        showNoise={showNoise}
        onToggleNoise={() => setShowNoise(!showNoise)}
        canUndo={history.length > 0}
      />

      {/* Progress indicators */}
      {(reframedCount > 0 || archivedCount > 0) && (
        <div className="flex gap-4 text-sm animate-fade-in">
          {reframedCount > 0 && (
            <span className="flex items-center gap-1.5 text-node-reframed-foreground bg-node-reframed/20 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              {reframedCount} reframed
            </span>
          )}
          {archivedCount > 0 && (
            <span className="flex items-center gap-1.5 text-muted-foreground bg-muted px-3 py-1 rounded-full">
              <Archive className="h-3.5 w-3.5" />
              {archivedCount} archived
            </span>
          )}
        </div>
      )}

      {/* Graph Container */}
      <div 
        className="relative w-full h-[400px] md:h-[500px] bg-card/50 rounded-2xl border border-border overflow-hidden"
        style={{ background: 'var(--breathe-gradient)' }}
        role="img"
        aria-label="Interactive worry graph visualization"
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {graph.edges.map((edge, i) => {
            const source = visibleNodes.find(n => n.id === edge.source);
            const target = visibleNodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            
            return (
              <line
                key={i}
                x1={`${source.x + 5}%`}
                y1={`${source.y + 5}%`}
                x2={`${target.x + 5}%`}
                y2={`${target.y + 5}%`}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                strokeDasharray="6,4"
                className="opacity-50"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {visibleNodes.map(node => (
          <WorryNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={() => handleNodeClick(node)}
            isPaused={isPaused}
            isReframed={reframedNodes.has(node.id)}
          />
        ))}
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <div className="bg-card rounded-xl p-5 max-w-md w-full border border-border animate-slide-up shadow-md">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
              reframedNodes.has(selectedNode.id) ? 'bg-node-reframed' :
              selectedNode.isRoot ? 'bg-node-root' : 
              selectedNode.isNoise ? 'bg-node-noise' : 'bg-node-neutral'
            }`} />
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium text-foreground">{selectedNode.text}</p>
                {selectedNode.fullText && selectedNode.fullText !== selectedNode.text && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedNode.fullText}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {reframedNodes.has(selectedNode.id)
                    ? '✨ This thought has been reframed'
                    : selectedNode.isRoot 
                      ? '🎯 This appears to be your core concern' 
                      : selectedNode.isNoise 
                        ? '💭 This might be background noise'
                        : '🔗 Related thought'
                  }
                </p>
              </div>
              
              {!reframedNodes.has(selectedNode.id) && !selectedNode.isNoise && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => setReframeDialogOpen(true)}
                    className="flex-1"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Reframe
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleArchive(selectedNode.id)}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5" />
                    Archive
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm" role="list" aria-label="Graph legend">
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-root" />
          <span className="text-muted-foreground">Root Concern</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-card border border-border" />
          <span className="text-muted-foreground">Connected</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-reframed" />
          <span className="text-muted-foreground">Reframed</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-noise opacity-60" />
          <span className="text-muted-foreground">Noise</span>
        </div>
      </div>

      <Button variant="hero" size="xl" onClick={onContinue}>
        Get a Fresh Perspective
      </Button>

      {/* Reframe Dialog */}
      <ThoughtReframeDialog
        node={selectedNode}
        open={reframeDialogOpen}
        onOpenChange={setReframeDialogOpen}
        onReframe={handleReframe}
      />
    </div>
  );
}
