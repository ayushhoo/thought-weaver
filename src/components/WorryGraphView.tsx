import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { WorryGraph, WorryNode } from '@/types/session';

interface WorryGraphViewProps {
  graph: WorryGraph;
  onContinue: () => void;
}

function WorryNodeComponent({ 
  node, 
  isSelected, 
  onClick 
}: { 
  node: WorryNode; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const baseDelay = Math.random() * 2;
  
  return (
    <div
      className={`
        absolute cursor-pointer transition-all duration-300 transform
        ${node.isRoot ? 'z-20' : node.isNoise ? 'z-5' : 'z-10'}
        ${isSelected ? 'scale-110' : 'hover:scale-105'}
        animate-node-float
      `}
      style={{ 
        left: `${node.x}%`, 
        top: `${node.y}%`,
        animationDelay: `${baseDelay}s`,
      }}
      onClick={onClick}
    >
      <div
        className={`
          rounded-full flex items-center justify-center p-4 shadow-lg
          transition-all duration-300
          ${node.isRoot 
            ? 'bg-primary text-primary-foreground w-32 h-32 md:w-40 md:h-40' 
            : node.isNoise 
              ? 'bg-muted text-muted-foreground/60 w-16 h-16 md:w-20 md:h-20 opacity-50'
              : 'bg-card text-card-foreground w-20 h-20 md:w-28 md:h-28 border border-border'
          }
          ${isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <span className={`text-center leading-tight ${
          node.isRoot ? 'text-sm md:text-base font-semibold' : 'text-xs md:text-sm'
        }`}>
          {node.text.length > 30 ? node.text.slice(0, 30) + '...' : node.text}
        </span>
      </div>
    </div>
  );
}

export function WorryGraphView({ graph, onContinue }: WorryGraphViewProps) {
  const [selectedNode, setSelectedNode] = useState<WorryNode | null>(null);

  const handleNodeClick = useCallback((node: WorryNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  // Find the root node
  const rootNode = graph.nodes.find(n => n.isRoot);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Your Worry Graph
        </h2>
        <p className="text-muted-foreground max-w-md">
          We've mapped out your thoughts. The <span className="text-primary font-medium">highlighted node</span> appears to be 
          your root concern.
        </p>
      </div>

      {/* Graph Container */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-card/50 rounded-2xl border border-border overflow-hidden">
        {/* Connection lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {graph.edges.map((edge, i) => {
            const source = graph.nodes.find(n => n.id === edge.source);
            const target = graph.nodes.find(n => n.id === edge.target);
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
                strokeDasharray="5,5"
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {graph.nodes.map(node => (
          <WorryNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <div className="bg-card rounded-lg p-4 max-w-md w-full border border-border animate-fade-in">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
              selectedNode.isRoot ? 'bg-primary' : selectedNode.isNoise ? 'bg-muted' : 'bg-accent-foreground'
            }`} />
            <div>
              <p className="font-medium text-foreground">{selectedNode.text}</p>
              {selectedNode.fullText && selectedNode.fullText !== selectedNode.text && (
                <p className="text-sm text-muted-foreground mt-2">{selectedNode.fullText}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {selectedNode.isRoot 
                  ? '🎯 This appears to be your core concern' 
                  : selectedNode.isNoise 
                    ? '💭 This might be background noise'
                    : '🔗 Related thought'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-muted-foreground">Root Concern</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-card border border-border" />
          <span className="text-muted-foreground">Connected Thought</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-muted opacity-50" />
          <span className="text-muted-foreground">Noise</span>
        </div>
      </div>

      <Button variant="hero" size="xl" onClick={onContinue}>
        Get a Fresh Perspective
      </Button>
    </div>
  );
}
