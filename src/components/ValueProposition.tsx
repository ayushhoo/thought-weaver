import { Sparkles } from 'lucide-react';

export function ValueProposition() {
  return (
    <div className="w-full bg-gradient-to-r from-accent via-background to-accent border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <p className="text-center text-sm md:text-base text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">Transform overthinking into clarity</span>
            {' '}— visualize your worries, find the root cause, and gain fresh perspectives.
          </span>
        </p>
      </div>
    </div>
  );
}
