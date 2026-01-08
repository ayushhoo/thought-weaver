import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmotionPicker } from './EmotionPicker';
import type { EmotionLevel } from '@/types/session';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';

interface ReflectionViewProps {
  emotionBefore: EmotionLevel | null;
  onComplete: (emotionAfter: EmotionLevel) => void;
  onStartNew: () => void;
}

export function ReflectionView({ emotionBefore, onComplete, onStartNew }: ReflectionViewProps) {
  const [emotionAfter, setEmotionAfter] = useState<EmotionLevel | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleSelect = (level: EmotionLevel) => {
    setEmotionAfter(level);
  };

  const handleContinue = () => {
    if (emotionAfter) {
      onComplete(emotionAfter);
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const improvement = emotionAfter && emotionBefore ? emotionAfter - emotionBefore : 0;
    
    return (
      <div className="flex flex-col items-center gap-8 animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Session Complete
          </h2>
          
          {improvement > 0 ? (
            <p className="text-muted-foreground max-w-md">
              You started feeling more anxious and now you're feeling calmer. 
              That's a <span className="text-primary font-medium">+{improvement} point improvement</span>! 
              You're making progress. 💜
            </p>
          ) : improvement === 0 ? (
            <p className="text-muted-foreground max-w-md">
              Your emotional state is stable. Sometimes maintaining calm is just as 
              important as improving. Be gentle with yourself. 💜
            </p>
          ) : (
            <p className="text-muted-foreground max-w-md">
              It's okay if you don't feel better immediately. Processing emotions 
              takes time. The fact that you showed up for yourself today matters. 💜
            </p>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border max-w-md w-full">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Before</p>
              <p className="text-3xl mt-1">
                {emotionBefore === 1 ? '😰' : emotionBefore === 2 ? '😟' : emotionBefore === 3 ? '😐' : emotionBefore === 4 ? '🙂' : '😊'}
              </p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">After</p>
              <p className="text-3xl mt-1">
                {emotionAfter === 1 ? '😰' : emotionAfter === 2 ? '😟' : emotionAfter === 3 ? '😐' : emotionAfter === 4 ? '🙂' : '😊'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="lg" onClick={onStartNew}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
          <Button variant="calm" size="lg">
            <Heart className="w-4 h-4 mr-2" />
            Save to Journal
          </Button>
        </div>

        <p className="text-sm text-muted-foreground max-w-sm">
          Remember: This app is not a replacement for professional help. 
          If you're in crisis, please reach out to a mental health professional.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <EmotionPicker
        selectedLevel={emotionAfter}
        onSelect={handleSelect}
        title="How are you feeling now?"
        subtitle="After this session, has anything shifted?"
      />

      {emotionAfter && (
        <Button variant="hero" size="xl" onClick={handleContinue}>
          Complete Session
        </Button>
      )}
    </div>
  );
}
