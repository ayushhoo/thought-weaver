import { useCallback, useState, useRef } from 'react';
import { useSession } from '@/hooks/useSession';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { EmotionPicker } from '@/components/EmotionPicker';
import { BrainDump } from '@/components/BrainDump';
import { ProcessingView } from '@/components/ProcessingView';
import { WorryGraphView } from '@/components/WorryGraphView';
import { PersonaSelector } from '@/components/PersonaSelector';
import { ReframeView } from '@/components/ReframeView';
import { ReflectionView } from '@/components/ReflectionView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import type { EmotionLevel, Persona, WorryGraph, APIWorryGraph } from '@/types/session';

// Transform API response to UI format with calculated positions
function transformAPIToWorryGraph(apiGraph: APIWorryGraph): WorryGraph {
  const nodeCount = apiGraph.nodes.length;
  const centerX = 50;
  const centerY = 50;
  const radius = 30;

  // Find root node and place it in center
  const rootNode = apiGraph.nodes.find(n => n.type === 'root');
  
  const nodes = apiGraph.nodes.map((node, index) => {
    let x: number, y: number;
    
    if (node.type === 'root') {
      x = centerX;
      y = centerY;
    } else {
      // Distribute other nodes in a circle around the root
      const otherNodes = apiGraph.nodes.filter(n => n.type !== 'root');
      const nodeIndex = otherNodes.findIndex(n => n.id === node.id);
      const angle = (2 * Math.PI * nodeIndex) / otherNodes.length - Math.PI / 2;
      x = centerX + radius * Math.cos(angle) + (Math.random() * 10 - 5);
      y = centerY + radius * Math.sin(angle) + (Math.random() * 10 - 5);
    }

    return {
      id: node.id,
      text: node.label,
      fullText: node.fullText,
      isRoot: node.type === 'root',
      isNoise: node.type === 'noise',
      x: Math.max(10, Math.min(85, x)),
      y: Math.max(10, Math.min(85, y)),
    };
  });

  const edges = apiGraph.edges.map(edge => ({
    source: edge.from,
    target: edge.to,
  }));

  return { nodes, edges };
}

export default function Session() {
  const {
    currentStep,
    session,
    goToStep,
    setEmotionBefore,
    setEmotionAfter,
    setTranscript,
    setWorryGraph,
    setSelectedPersona,
    resetSession,
  } = useSession();

  const [tempEmotionBefore, setTempEmotionBefore] = useState<EmotionLevel | null>(null);
  const [tempPersona, setTempPersona] = useState<Persona | null>(null);
  const transcriptRef = useRef<string>('');

  const handleStartSession = useCallback(() => {
    goToStep('emotion-check');
  }, [goToStep]);

  const handleEmotionBeforeSelect = useCallback((level: EmotionLevel) => {
    setTempEmotionBefore(level);
  }, []);

  const handleEmotionBeforeContinue = useCallback(() => {
    if (tempEmotionBefore) {
      setEmotionBefore(tempEmotionBefore);
      goToStep('brain-dump');
    }
  }, [tempEmotionBefore, setEmotionBefore, goToStep]);

  const handleBrainDumpComplete = useCallback((transcript: string) => {
    transcriptRef.current = transcript;
    setTranscript(transcript);
    goToStep('processing');
  }, [setTranscript, goToStep]);

  const extractWorryGraph = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-worry-graph`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transcript: transcriptRef.current }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze thoughts');
      }

      const apiGraph: APIWorryGraph = await response.json();
      const worryGraph = transformAPIToWorryGraph(apiGraph);
      setWorryGraph(worryGraph);
      goToStep('worry-graph');
    } catch (error) {
      console.error('Worry graph extraction error:', error);
      toast.error('Failed to analyze your thoughts. Please try again.');
      goToStep('brain-dump');
    }
  }, [setWorryGraph, goToStep]);

  const handleProcessingComplete = useCallback(() => {
    extractWorryGraph();
  }, [extractWorryGraph]);

  const handleWorryGraphContinue = useCallback(() => {
    goToStep('persona-select');
  }, [goToStep]);

  const handlePersonaSelect = useCallback((persona: Persona) => {
    setTempPersona(persona);
  }, []);

  const handlePersonaContinue = useCallback(() => {
    if (tempPersona) {
      setSelectedPersona(tempPersona);
      goToStep('reframe');
    }
  }, [tempPersona, setSelectedPersona, goToStep]);

  const handleReframeContinue = useCallback(() => {
    goToStep('reflection');
  }, [goToStep]);

  const handleReflectionComplete = useCallback((emotionAfter: EmotionLevel) => {
    setEmotionAfter(emotionAfter);
  }, [setEmotionAfter]);

  const handleStartNew = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleBack = useCallback(() => {
    const stepOrder = ['welcome', 'emotion-check', 'brain-dump', 'processing', 'worry-graph', 'persona-select', 'reframe', 'reflection'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1] as any);
    }
  }, [currentStep, goToStep]);

  const handleClose = useCallback(() => {
    goToStep('welcome');
  }, [goToStep]);

  const showNavigation = currentStep !== 'welcome' && currentStep !== 'processing';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      {showNavigation && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              MindVista
            </span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`${showNavigation ? 'pt-14' : ''}`}>
        {currentStep === 'welcome' && (
          <WelcomeScreen onStart={handleStartSession} />
        )}

        {currentStep === 'emotion-check' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <EmotionPicker
              selectedLevel={tempEmotionBefore}
              onSelect={handleEmotionBeforeSelect}
            />
            {tempEmotionBefore && (
              <Button 
                variant="hero" 
                size="xl" 
                onClick={handleEmotionBeforeContinue}
                className="mt-8 animate-fade-in"
              >
                Continue to Brain Dump
              </Button>
            )}
          </div>
        )}

        {currentStep === 'brain-dump' && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <BrainDump onComplete={handleBrainDumpComplete} />
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <ProcessingView onComplete={handleProcessingComplete} />
          </div>
        )}

        {currentStep === 'worry-graph' && session.worryGraph && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <WorryGraphView 
              graph={session.worryGraph} 
              onContinue={handleWorryGraphContinue} 
            />
          </div>
        )}

        {currentStep === 'persona-select' && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <PersonaSelector 
              selectedPersona={tempPersona}
              onSelect={(persona) => {
                handlePersonaSelect(persona);
                if (tempPersona === persona) {
                  handlePersonaContinue();
                }
              }}
            />
          </div>
        )}

        {currentStep === 'reframe' && session.selectedPersona && session.worryGraph && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <ReframeView
              persona={session.selectedPersona}
              rootConcern={session.worryGraph.nodes.find(n => n.isRoot)?.text || ''}
              onContinue={handleReframeContinue}
            />
          </div>
        )}

        {currentStep === 'reflection' && (
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <ReflectionView
              emotionBefore={session.emotionBefore ?? null}
              onComplete={handleReflectionComplete}
              onStartNew={handleStartNew}
            />
          </div>
        )}
      </main>
    </div>
  );
}
