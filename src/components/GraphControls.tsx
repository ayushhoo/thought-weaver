import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Pause, 
  Play, 
  Undo2, 
  RotateCcw, 
  Leaf,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface GraphControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onUndo: () => void;
  onReset: () => void;
  calmMode: boolean;
  onToggleCalmMode: () => void;
  showNoise: boolean;
  onToggleNoise: () => void;
  canUndo: boolean;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function GraphControls({
  isPaused,
  onTogglePause,
  onUndo,
  onReset,
  calmMode,
  onToggleCalmMode,
  showNoise,
  onToggleNoise,
  canUndo,
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
}: GraphControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className="flex items-center gap-1.5 p-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-md"
        role="toolbar"
        aria-label="Graph controls"
      >
        {/* Pause/Play */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePause}
              className="h-9 w-9"
              aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
            >
              {isPaused ? (
                <Play className="h-4 w-4 text-primary" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isPaused ? 'Resume' : 'Freeze'} mind map</p>
          </TooltipContent>
        </Tooltip>

        {/* Undo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-9 w-9"
              aria-label="Undo last action"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Undo last action</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-9 w-9"
              aria-label="Reset session"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Reset session</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Show/Hide Noise */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNoise}
              className="h-9 w-9"
              aria-label={showNoise ? 'Hide noise thoughts' : 'Show noise thoughts'}
            >
              {showNoise ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{showNoise ? 'Hide' : 'Show'} noise thoughts</p>
          </TooltipContent>
        </Tooltip>

        {/* Calm Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCalmMode}
              className={`h-9 w-9 ${calmMode ? 'bg-accent text-primary' : ''}`}
              aria-label={calmMode ? 'Disable calm mode' : 'Enable calm mode'}
            >
              <Leaf className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{calmMode ? 'Disable' : 'Enable'} calm mode</p>
          </TooltipContent>
        </Tooltip>

        {onZoomIn && onZoomOut && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* Zoom controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomOut}
                  className="h-9 w-9"
                  aria-label="Zoom out"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom out</p>
              </TooltipContent>
            </Tooltip>

            <span className="text-xs text-muted-foreground min-w-[3ch] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomIn}
                  className="h-9 w-9"
                  aria-label="Zoom in"
                  disabled={zoomLevel >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom in</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
