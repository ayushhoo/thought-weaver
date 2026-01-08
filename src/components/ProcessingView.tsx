import { useEffect, useState } from 'react';
import { Brain, Sparkles, Network } from 'lucide-react';

interface ProcessingViewProps {
  onComplete: () => void;
}

const steps = [
  { icon: Brain, text: 'Listening to your thoughts...' },
  { icon: Sparkles, text: 'Extracting key concerns...' },
  { icon: Network, text: 'Building your worry graph...' },
];

export function ProcessingView({ onComplete }: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(onComplete, 1500);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in min-h-[400px]">
      {/* Animated Brain Icon */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-breathe">
          <Brain className="w-16 h-16 text-primary" />
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isActive ? 'opacity-100 scale-105' : isComplete ? 'opacity-50' : 'opacity-30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-sm">
        We're analyzing your thoughts to help you find clarity. This only takes a moment.
      </p>
    </div>
  );
}
