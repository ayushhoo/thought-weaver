import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Lightbulb } from 'lucide-react';
import type { WorryNode } from '@/types/session';

interface ThoughtReframeDialogProps {
  node: WorryNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReframe: (nodeId: string, newText: string) => void;
}

const reflectiveQuestions = [
  "What evidence supports this thought? What evidence contradicts it?",
  "How would you advise a friend who had this thought?",
  "Will this matter in 5 years? In 1 year? In a month?",
  "What's the most realistic outcome, not the worst-case scenario?",
  "What can you control about this situation?",
  "Is there another way to look at this?",
];

export function ThoughtReframeDialog({
  node,
  open,
  onOpenChange,
  onReframe,
}: ThoughtReframeDialogProps) {
  const [reframedText, setReframedText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open && node) {
      setReframedText('');
      setCurrentQuestion(Math.floor(Math.random() * reflectiveQuestions.length));
      setShowSuccess(false);
    }
  }, [open, node]);

  const handleReframe = () => {
    if (node && reframedText.trim()) {
      setShowSuccess(true);
      setTimeout(() => {
        onReframe(node.id, reframedText.trim());
        onOpenChange(false);
      }, 600);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % reflectiveQuestions.length);
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Reframe This Thought
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Challenge and transform this thought into a more balanced perspective.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original thought */}
          <div className="p-4 bg-node-anxious/20 border border-node-anxious/30 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Original thought:</p>
            <p className="text-foreground">{node.fullText || node.text}</p>
          </div>

          {/* Reflective question */}
          <div className="p-4 bg-accent rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Consider:</p>
                <p className="text-muted-foreground text-sm">{reflectiveQuestions[currentQuestion]}</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="px-0 h-auto mt-2 text-xs text-primary"
                >
                  Try a different question →
                </Button>
              </div>
            </div>
          </div>

          {/* Reframed thought input */}
          <div className="space-y-2">
            <label htmlFor="reframe" className="text-sm font-medium text-foreground">
              Your reframed thought:
            </label>
            <Textarea
              id="reframe"
              placeholder="Write a more balanced way to think about this..."
              value={reframedText}
              onChange={(e) => setReframedText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-assisted suggestions require confirmation before applying
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReframe}
            disabled={!reframedText.trim()}
            className={showSuccess ? 'bg-node-reframed text-node-reframed-foreground' : ''}
          >
            {showSuccess ? (
              <>✓ Reframed!</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Reframe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
