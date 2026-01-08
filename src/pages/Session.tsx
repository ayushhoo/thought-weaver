import { useCallback, useState } from 'react';
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
import type { EmotionLevel, Persona, WorryGraph } from '@/types/session';

// Sample worry graph for demo
const sampleWorryGraph: WorryGraph = {
  nodes: [
    { id: '1', text: 'Fear of failing the presentation', isRoot: true, isNoise: false, x: 40, y: 35 },
    { id: '2', text: 'Work deadline stress', isRoot: false, isNoise: false, x: 65, y: 20 },
    { id: '3', text: 'What if I forget my words?', isRoot: false, isNoise: false, x: 20, y: 55 },
    { id: '4', text: "People might think I'm unprepared", isRoot: false, isNoise: false, x: 60, y: 60 },
    { id: '5', text: 'Need to buy groceries', isRoot: false, isNoise: true, x: 80, y: 45 },
    { id: '6', text: "Haven't called mom this week", isRoot: false, isNoise: true, x: 10, y: 25 },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '3', target: '4' },
  ],
};

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
    setTranscript(transcript);
    goToStep('processing');
  }, [setTranscript, goToStep]);

  const handleProcessingComplete = useCallback(() => {
    setWorryGraph(sampleWorryGraph);
    goToStep('worry-graph');
  }, [setWorryGraph, goToStep]);

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
