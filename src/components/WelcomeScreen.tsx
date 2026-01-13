import { Button } from '@/components/ui/button';
import { ValueProposition } from '@/components/ValueProposition';
import { Brain, Sparkles, Users, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-calm-waves.png';

interface WelcomeScreenProps {
  onStart: () => void;
  onStartGuided?: () => void;
}

export function WelcomeScreen({ onStart, onStartGuided }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Value Proposition Banner */}
      <ValueProposition />

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background with gradient overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ background: 'var(--breathe-gradient)', opacity: 0.7 }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-3 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Mind<span className="text-primary">Vista</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              The Anxiety De-Tangler
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-lg mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Speak your worries, see them visualized, and gain fresh perspectives 
            through the lens of different personas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={onStart} className="shadow-glow">
              Start Brain Dump
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {onStartGuided && (
              <Button variant="outline" size="xl" onClick={onStartGuided}>
                Take the Guided Tour
              </Button>
            )}
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Your thoughts stay private — processed locally, never stored
            </span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Brain className="w-7 h-7 text-primary" />}
              title="Brain Dump"
              description="Speak freely for 2 minutes. No interruptions, no judgment — just release."
              step="1"
            />
            <FeatureCard
              icon={<Sparkles className="w-7 h-7 text-primary" />}
              title="Worry Graph"
              description="See your thoughts visualized. Find the root cause, filter the noise."
              step="2"
            />
            <FeatureCard
              icon={<Users className="w-7 h-7 text-primary" />}
              title="Perspective Shift"
              description="Get reframed through Stoic wisdom, gentle compassion, or logical analysis."
              step="3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  step
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  step: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-background border border-border hover:shadow-md transition-shadow">
      {/* Step indicator */}
      <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
        Step {step}
      </div>
      <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
