import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import type { WorryNode, WorryGraph } from '@/types/session';

interface GuidedOnboardingProps {
  onComplete: (graph: WorryGraph) => void;
  onSkip: () => void;
}

const exampleThoughts: WorryNode[] = [
  {
    id: 'example-1',
    text: 'Work deadline stress',
    fullText: "I'm worried about the upcoming project deadline",
    isRoot: true,
    isNoise: false,
    x: 50,
    y: 45,
  },
  {
    id: 'example-2',
    text: 'Fear of failure',
    fullText: "What if I can't deliver on time?",
    isRoot: false,
    isNoise: false,
    x: 25,
    y: 60,
  },
  {
    id: 'example-3',
    text: 'Team expectations',
    fullText: "The team is counting on me",
    isRoot: false,
    isNoise: false,
    x: 75,
    y: 55,
  },
  {
    id: 'example-4',
    text: 'Weather tomorrow',
    fullText: "I wonder if it will rain",
    isRoot: false,
    isNoise: true,
    x: 70,
    y: 25,
  },
];

const exampleEdges = [
  { source: 'example-1', target: 'example-2' },
  { source: 'example-1', target: 'example-3' },
];

export function GuidedOnboarding({ onComplete, onSkip }: GuidedOnboardingProps) {
  const [step, setStep] = useState<'intro' | 'add-thought' | 'show-graph' | 'explain'>('intro');
  const [userThought, setUserThought] = useState('');
  const [showingNodes, setShowingNodes] = useState<number>(0);

  const handleAddThought = useCallback(() => {
    if (userThought.trim()) {
      setStep('show-graph');
      // Animate nodes appearing
      const timer = setInterval(() => {
        setShowingNodes(prev => {
          if (prev >= exampleThoughts.length) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
  }, [userThought]);

  const handleContinueToExplain = useCallback(() => {
    setStep('explain');
  }, []);

  const handleComplete = useCallback(() => {
    // Create a graph with the user's thought as root
    const userNode: WorryNode = {
      id: 'user-root',
      text: userThought.length > 30 ? userThought.slice(0, 30) + '...' : userThought,
      fullText: userThought,
      isRoot: true,
      isNoise: false,
      x: 50,
      y: 45,
    };

    const graph: WorryGraph = {
      nodes: [userNode, ...exampleThoughts.slice(1)],
      edges: exampleEdges.map(e => e.source === 'example-1' ? { ...e, source: 'user-root' } : e),
    };

    onComplete(graph);
  }, [userThought, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {step === 'intro' && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Let's visualize your thoughts
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start by adding a worry or thought that's on your mind. 
              We'll show you how it connects to other thoughts.
            </p>
          </div>
          <Button onClick={() => setStep('add-thought')} variant="hero" size="lg">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="link" onClick={onSkip} className="text-muted-foreground">
            Skip intro, I know how this works
          </Button>
        </div>
      )}

      {step === 'add-thought' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              What's weighing on your mind?
            </h2>
            <p className="text-muted-foreground text-sm">
              Type a worry, concern, or anxious thought
            </p>
          </div>
          
          <div className="flex gap-3">
            <Input
              value={userThought}
              onChange={(e) => setUserThought(e.target.value)}
              placeholder="e.g., I'm worried about my presentation tomorrow..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddThought()}
              autoFocus
            />
            <Button 
              onClick={handleAddThought}
              disabled={!userThought.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      {step === 'show-graph' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Watch your thought take shape
            </h2>
            <p className="text-muted-foreground text-sm">
              See how thoughts connect and branch out
            </p>
          </div>

          {/* Mini graph visualization */}
          <div className="relative h-[300px] bg-card/50 rounded-xl border border-border overflow-hidden">
            {/* User's thought as root */}
            {showingNodes >= 1 && (
              <div 
                className="absolute animate-scale-in"
                style={{ left: '45%', top: '40%' }}
              >
                <div className="w-28 h-28 rounded-full bg-node-root flex items-center justify-center p-3 shadow-lg">
                  <span className="text-xs text-node-root-foreground text-center font-medium leading-tight">
                    {userThought.length > 25 ? userThought.slice(0, 25) + '...' : userThought}
                  </span>
                </div>
              </div>
            )}

            {/* Connected thoughts */}
            {showingNodes >= 2 && (
              <div 
                className="absolute animate-scale-in"
                style={{ left: '20%', top: '55%', animationDelay: '0.2s' }}
              >
                <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center p-2 shadow-md">
                  <span className="text-xs text-center text-muted-foreground">
                    Related worry
                  </span>
                </div>
              </div>
            )}

            {showingNodes >= 3 && (
              <div 
                className="absolute animate-scale-in"
                style={{ left: '65%', top: '50%', animationDelay: '0.4s' }}
              >
                <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center p-2 shadow-md">
                  <span className="text-xs text-center text-muted-foreground">
                    Cause/effect
                  </span>
                </div>
              </div>
            )}

            {showingNodes >= 4 && (
              <div 
                className="absolute animate-scale-in depth-tertiary"
                style={{ left: '60%', top: '20%', animationDelay: '0.6s' }}
              >
                <div className="w-14 h-14 rounded-full bg-node-noise flex items-center justify-center p-2 shadow-sm">
                  <span className="text-xs text-center text-node-noise-foreground">
                    Noise
                  </span>
                </div>
              </div>
            )}

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {showingNodes >= 2 && (
                <line
                  x1="48%" y1="55%"
                  x2="30%" y2="65%"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-fade-in"
                />
              )}
              {showingNodes >= 3 && (
                <line
                  x1="55%" y1="52%"
                  x2="70%" y2="58%"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                />
              )}
            </svg>
          </div>

          {showingNodes >= 4 && (
            <div className="text-center animate-fade-in">
              <Button onClick={handleContinueToExplain} variant="hero" size="lg">
                I understand, continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'explain' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              How it works
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-node-root flex items-center justify-center flex-shrink-0">
                <span className="text-node-root-foreground font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Root concern</h3>
                <p className="text-sm text-muted-foreground">
                  The core worry at the heart of your thoughts, shown in the center
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center flex-shrink-0">
                <span className="text-foreground font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Connected thoughts</h3>
                <p className="text-sm text-muted-foreground">
                  Related worries that connect to your main concern
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-node-noise flex items-center justify-center flex-shrink-0">
                <span className="text-node-noise-foreground font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Noise thoughts</h3>
                <p className="text-sm text-muted-foreground">
                  Less relevant distractions, faded to help you focus
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={handleComplete} variant="hero" size="lg">
              Start my session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
