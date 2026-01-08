import { Button } from '@/components/ui/button';
import type { EmotionLevel } from '@/types/session';

const emotions: { level: EmotionLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😰', label: 'Very Anxious' },
  { level: 2, emoji: '😟', label: 'Worried' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Okay' },
  { level: 5, emoji: '😊', label: 'Calm' },
];

interface EmotionPickerProps {
  selectedLevel?: EmotionLevel | null;
  onSelect: (level: EmotionLevel) => void;
  title?: string;
  subtitle?: string;
}

export function EmotionPicker({ 
  selectedLevel, 
  onSelect, 
  title = "How are you feeling right now?",
  subtitle = "Be honest — there's no wrong answer"
}: EmotionPickerProps) {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {emotions.map(({ level, emoji, label }) => (
          <Button
            key={level}
            variant="emotion"
            className={`flex flex-col gap-2 h-auto py-4 px-6 min-w-[100px] ${
              selectedLevel === level 
                ? 'border-primary bg-accent shadow-lg scale-105' 
                : ''
            }`}
            onClick={() => onSelect(level)}
          >
            <span className="text-4xl">{emoji}</span>
            <span className="text-sm font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
