import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Sparkles } from 'lucide-react';

interface PreviewPanelProps {
  originalText: string;
  generatedText: string;
  onAccept: () => void;
  onReject: () => void;
}

const PreviewPanel = ({ originalText, generatedText, onAccept, onReject }: PreviewPanelProps) => {
  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-4 border-2 border-primary/20 bg-accent/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Preview AI Continuation</h3>
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Your Text:</p>
          <div className="rounded-lg bg-editor-bg p-4 text-foreground">
            <p className="line-clamp-3">{originalText}</p>
          </div>
        </div>
        
        <div>
          <p className="mb-2 text-sm font-medium text-primary">AI Continuation:</p>
          <div className="rounded-lg border-2 border-primary/30 bg-editor-bg p-4 text-foreground">
            <p>{generatedText}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={onAccept}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover"
          size="lg"
        >
          <Check className="mr-2 h-5 w-5" />
          Accept
        </Button>
        <Button
          onClick={onReject}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <X className="mr-2 h-5 w-5" />
          Reject
        </Button>
      </div>
    </Card>
  );
};

export default PreviewPanel;
