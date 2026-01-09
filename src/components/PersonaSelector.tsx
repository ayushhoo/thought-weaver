import { Button } from '@/components/ui/button';
import type { Persona } from '@/types/session';

interface PersonaOption {
  id: Persona;
  emoji: string;
  name: string;
  description: string;
  style: string;
}

const personas: PersonaOption[] = [
  {
    id: 'stoic',
    emoji: '🏛️',
    name: 'The Stoic Philosopher',
    description: 'Drawing from ancient Stoic wisdom, I help you distinguish between what you can control and what you cannot. Together, we\'ll find peace by accepting life\'s uncertainties while taking purposeful action where it matters.',
    style: 'Calm • Rational • Grounding',
  },
  {
    id: 'grandma',
    emoji: '👵',
    name: 'The Compassionate Grandma',
    description: 'Using compassion-focused therapy, I offer the warmth and unconditional acceptance we all need. I\'ll help you treat yourself with the same kindness you\'d show a dear friend, soothing your inner critic with gentle wisdom.',
    style: 'Warm • Nurturing • Comforting',
  },
  {
    id: 'detective',
    emoji: '🔍',
    name: 'The Logic Detective',
    description: 'Trained in Cognitive Behavioral Therapy, I help you investigate your thoughts like clues. We\'ll examine the evidence, challenge cognitive distortions, and uncover the truth hidden beneath your worries.',
    style: 'Analytical • Curious • Methodical',
  },
];

interface PersonaSelectorProps {
  onSelect: (persona: Persona) => void;
  selectedPersona?: Persona | null;
}

export function PersonaSelector({ onSelect, selectedPersona }: PersonaSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Choose Your Guide
        </h2>
        <p className="text-muted-foreground max-w-md">
          Select a perspective that resonates with you. Each guide offers a unique way 
          to reframe your thoughts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {personas.map((persona) => (
          <Button
            key={persona.id}
            variant="persona"
            className={`flex flex-col items-start gap-3 h-auto p-6 text-left ${
              selectedPersona === persona.id 
                ? 'border-primary bg-accent' 
                : ''
            }`}
            onClick={() => onSelect(persona.id)}
          >
            <span className="text-4xl">{persona.emoji}</span>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">{persona.name}</h3>
              <p className="text-sm text-muted-foreground">{persona.description}</p>
              <p className="text-xs text-primary italic">{persona.style}</p>
            </div>
          </Button>
        ))}
      </div>

      {selectedPersona && (
        <Button variant="hero" size="xl" onClick={() => onSelect(selectedPersona)}>
          Continue with {personas.find(p => p.id === selectedPersona)?.name.split(' ')[1]}
        </Button>
      )}
    </div>
  );
}
