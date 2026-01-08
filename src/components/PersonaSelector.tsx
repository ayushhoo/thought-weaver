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
    description: 'Offers timeless wisdom about focusing on what you can control and letting go of what you cannot.',
    style: 'Calm, rational, and grounding',
  },
  {
    id: 'grandma',
    emoji: '👵',
    name: 'The Compassionate Grandma',
    description: 'Wraps your worries in warmth and reminds you that everything will be okay, with gentle reassurance.',
    style: 'Warm, nurturing, and comforting',
  },
  {
    id: 'detective',
    emoji: '🔍',
    name: 'The Logic Detective',
    description: 'Helps you examine the evidence behind your worries and separate facts from assumptions.',
    style: 'Analytical, curious, and methodical',
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
