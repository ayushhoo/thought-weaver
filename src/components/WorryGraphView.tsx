import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { GraphControls } from '@/components/GraphControls';
import { ThoughtReframeDialog } from '@/components/ThoughtReframeDialog';
import { Sparkles, Archive } from 'lucide-react';
import type { WorryGraph, WorryNode } from '@/types/session';
import { useAccessibility } from '@/hooks/useAccessibility';

interface WorryGraphViewProps {
  graph: WorryGraph;
  onContinue: () => void;
  onGraphUpdate?: (graph: WorryGraph) => void;
}

// Brownian motion offset generator
function useBrownianMotion(isPaused: boolean, nodeId: string) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>();
  const velocityRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (isPaused) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const maxOffset = 8; // Maximum pixels from origin
    const damping = 0.98;
    const randomForce = 0.15;

    const animate = () => {
      // Add random force (Brownian motion)
      velocityRef.current.x += (Math.random() - 0.5) * randomForce;
      velocityRef.current.y += (Math.random() - 0.5) * randomForce;
      
      // Apply damping
      velocityRef.current.x *= damping;
      velocityRef.current.y *= damping;
      
      // Calculate new position
      let newX = offset.x + velocityRef.current.x;
      let newY = offset.y + velocityRef.current.y;
      
      // Soft boundary - spring back towards center
      const distance = Math.sqrt(newX * newX + newY * newY);
      if (distance > maxOffset) {
        const factor = maxOffset / distance;
        newX *= factor;
        newY *= factor;
        velocityRef.current.x *= 0.5;
        velocityRef.current.y *= 0.5;
      }
      
      setOffset({ x: newX, y: newY });
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPaused, nodeId]);

  return offset;
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
  const brownianOffset = useBrownianMotion(isPaused, node.id);
  const baseDelay = useMemo(() => Math.random() * 3, []);
  
  const sizeClasses = node.isRoot 
    ? 'w-36 h-36 md:w-44 md:h-44' 
    : node.isNoise 
      ? 'w-16 h-16 md:w-20 md:h-20'
      : 'w-24 h-24 md:w-32 md:h-32';

  const colorClasses = isReframed
    ? 'bg-node-reframed text-node-reframed-foreground shadow-glow-success'
    : node.isRoot 
      ? 'bg-node-root text-node-root-foreground shadow-glow node-glow' 
      : node.isNoise 
        ? 'bg-node-noise/80 text-node-noise-foreground'
        : 'bg-card/80 text-card-foreground border border-border/50 glass';

  const depthClasses = node.isNoise ? 'depth-tertiary' : depth === 'secondary' ? 'depth-secondary' : '';
  
  return (
    <button
      className={`
        absolute cursor-pointer transition-all duration-500 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${node.isRoot ? 'z-20' : node.isNoise ? 'z-5' : 'z-10'}
        ${isSelected ? 'scale-110' : 'hover:scale-105'}
        ${isReframed ? 'animate-reframe-glow' : ''}
        ${depthClasses}
      `}
      style={{ 
        left: `calc(${node.x}% + ${brownianOffset.x}px)`, 
        top: `calc(${node.y}% + ${brownianOffset.y}px)`,
        animationDelay: `${baseDelay}s`,
      }}
      onClick={onClick}
      aria-label={`${node.isRoot ? 'Root concern: ' : node.isNoise ? 'Noise thought: ' : 'Connected thought: '}${node.text}`}
    >
      <div
        className={`
          rounded-full flex items-center justify-center p-4 transition-all duration-500 backdrop-blur-sm
          ${sizeClasses}
          ${colorClasses}
          ${isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <span className={`text-center leading-tight ${
          node.isRoot ? 'text-xs md:text-sm font-semibold' : 'text-xs'
        }`}>
          {node.text.length > 30 ? node.text.slice(0, 30) + '...' : node.text}
        </span>
      </div>
    </button>
  );
}

// Silk-like connection line component
function SilkConnection({ 
  source, 
  target, 
  isPaused 
}: { 
  source: WorryNode; 
  target: WorryNode;
  isPaused: boolean;
}) {
  const sourceOffset = useBrownianMotion(isPaused, `${source.id}-line`);
  const targetOffset = useBrownianMotion(isPaused, `${target.id}-line`);

  return (
    <line
      x1={`calc(${source.x + 5}% + ${sourceOffset.x}px)`}
      y1={`calc(${source.y + 5}% + ${sourceOffset.y}px)`}
      x2={`calc(${target.x + 5}% + ${targetOffset.x}px)`}
      y2={`calc(${target.y + 5}% + ${targetOffset.y}px)`}
      stroke="url(#silk-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      className="opacity-40"
      style={{
        filter: 'blur(0.5px)',
      }}
    />
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

  const visibleEdges = useMemo(() => {
    return graph.edges.filter(edge => {
      const sourceVisible = visibleNodes.some(n => n.id === edge.source);
      const targetVisible = visibleNodes.some(n => n.id === edge.target);
      return sourceVisible && targetVisible;
    });
  }, [graph.edges, visibleNodes]);

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

  const reframedCount = reframedNodes.size;
  const archivedCount = archivedNodes.size;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in w-full max-w-5xl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Your Worry Graph
        </h2>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Your thoughts float gently. Click any to explore. The <span className="text-primary font-medium">glowing node</span> is your root concern.
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
            <span className="flex items-center gap-1.5 text-node-reframed-foreground bg-node-reframed/20 px-3 py-1.5 rounded-full glass">
              <Sparkles className="h-3.5 w-3.5" />
              {reframedCount} reframed
            </span>
          )}
          {archivedCount > 0 && (
            <span className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full glass">
              <Archive className="h-3.5 w-3.5" />
              {archivedCount} archived
            </span>
          )}
        </div>
      )}

      {/* Graph Container - Infinite feel, no borders */}
      <div 
        className="relative w-full h-[450px] md:h-[550px] infinite-graph-bg rounded-3xl overflow-visible"
        role="img"
        aria-label="Interactive worry graph visualization"
      >
        {/* SVG Gradient definitions */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="silk-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(174 62% 47%)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(263 45% 55%)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(174 62% 47%)" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Connection lines with silk effect */}
          {visibleEdges.map((edge, i) => {
            const source = visibleNodes.find(n => n.id === edge.source);
            const target = visibleNodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            
            return (
              <g key={i} filter="url(#glow)">
                <line
                  x1={`${source.x + 5}%`}
                  y1={`${source.y + 5}%`}
                  x2={`${target.x + 5}%`}
                  y2={`${target.y + 5}%`}
                  stroke="url(#silk-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-30"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes with Brownian motion */}
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

      {/* Selected Node Detail - Glassmorphism */}
      {selectedNode && (
        <div className="ethereal-card rounded-2xl p-6 max-w-md w-full animate-slide-up">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
              reframedNodes.has(selectedNode.id) ? 'bg-node-reframed' :
              selectedNode.isRoot ? 'bg-node-root shadow-glow' : 
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
                    className="glass"
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

      {/* Legend - Subtle */}
      <div className="flex flex-wrap justify-center gap-4 text-sm opacity-70" role="list" aria-label="Graph legend">
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-root shadow-glow" />
          <span className="text-muted-foreground">Root Concern</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-card/80 border border-border/50" />
          <span className="text-muted-foreground">Connected</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-reframed shadow-glow-success" />
          <span className="text-muted-foreground">Reframed</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded-full bg-node-noise/60" />
          <span className="text-muted-foreground">Noise</span>
        </div>
      </div>

      <Button variant="hero" size="xl" onClick={onContinue} className="mt-4">
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
