import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import type { Persona } from '@/types/session';

interface ReframeViewProps {
  persona: Persona;
  rootConcern: string;
  onContinue: () => void;
}

const personaResponses: Record<Persona, (concern: string) => string> = {
  stoic: (concern) => `Let us examine this concern together. "${concern}" — this weighs on you, but consider: is this within your sphere of control?

The Stoics teach us that we suffer more in imagination than in reality. What you fear may happen, but it also may not. And if it does, you will find the strength to face it — as you have faced challenges before.

Focus not on the outcome, but on your response. You control your effort, your preparation, your attitude. The rest belongs to fate.

Remember: The obstacle is the way. This very challenge is your opportunity to grow stronger, wiser, more resilient.

Take a breath. You are exactly where you need to be.`,

  grandma: (concern) => `Oh, sweetheart, come sit with me for a moment. I can see "${concern}" has been troubling you, and I want you to know — that's okay. It's okay to feel worried.

You know what I've learned in all my years? The things we worry about most rarely turn out as bad as we imagine. And even when they do, we find a way through. We always do.

You're stronger than you think, my dear. I've watched you overcome so much already. This is just another chapter in your story — not the whole book.

Would you like some tea? Sometimes the best thing we can do is slow down, breathe, and remind ourselves that right now, in this moment, we're okay.

I believe in you. I always have.`,

  detective: (concern) => `Interesting case we have here. The concern in question: "${concern}". Let's examine the evidence.

First question: What are the facts? Not assumptions, not predictions — hard facts. Let's separate what you *know* from what you're *imagining*.

Second: What's the probability? If we look at past similar situations, how often did the worst-case scenario actually occur?

Third: And this is crucial — what's the evidence *against* your worry? What are you overlooking in your anxiety?

I've found that most worries, when subjected to rigorous analysis, don't hold up under scrutiny. The mind has a tendency to catastrophize, to fill in gaps with worst-case scenarios.

Let's test this hypothesis: What would you tell a friend who came to you with this same concern?

Often, the answer reveals what we already know but are afraid to believe.`,
};

const personaEmoji: Record<Persona, string> = {
  stoic: '🏛️',
  grandma: '👵',
  detective: '🔍',
};

const personaNames: Record<Persona, string> = {
  stoic: 'The Stoic Philosopher',
  grandma: 'Compassionate Grandma',
  detective: 'The Logic Detective',
};

export function ReframeView({ persona, rootConcern, onContinue }: ReframeViewProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const fullText = personaResponses[persona](rootConcern);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in max-w-2xl mx-auto">
      {/* Persona Header */}
      <div className="flex items-center gap-3 bg-card rounded-full px-6 py-3 border border-border">
        <span className="text-3xl">{personaEmoji[persona]}</span>
        <div>
          <p className="font-semibold text-foreground">{personaNames[persona]}</p>
          <p className="text-xs text-muted-foreground">Speaking to you...</p>
        </div>
      </div>

      {/* Response Card */}
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-lg w-full">
        <p className="text-foreground leading-relaxed whitespace-pre-line text-lg">
          {displayedText}
          {isTyping && <span className="animate-pulse-soft">|</span>}
        </p>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="calm"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button
          variant="calm"
          size="icon"
          onClick={() => {
            setDisplayedText('');
            setIsTyping(true);
          }}
          title="Replay"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Continue Button */}
      {!isTyping && (
        <Button variant="hero" size="xl" onClick={onContinue} className="animate-fade-in">
          How Do I Feel Now?
        </Button>
      )}
    </div>
  );
}
