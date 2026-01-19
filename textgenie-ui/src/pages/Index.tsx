import { useMachine } from "@xstate/react";
import { editorMachine } from "@/machines/editorMachine";
import CodeEditor from "@/components/CodeEditor";
import PreviewPanel from "@/components/PreviewPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

const Index = () => {
  const [state, send] = useMachine(editorMachine);
  const { toast } = useToast();

  const handleContinueWriting = async () => {
    if (!state.context.content.trim()) {
      toast({
        title: "No content",
        description: "Please write something first before continuing.",
        variant: "destructive",
      });
      return;
    }

    send({ type: "CONTINUE_WRITING" });

    try {
      const { data, error } = await supabase.functions.invoke(
        "continue-writing",
        {
          body: { content: state.context.content },
        }
      );

      if (error) {
        console.error("Error calling function:", error);
        send({
          type: "GENERATION_ERROR",
          error: error.message || "Failed to generate text",
        });
        toast({
          title: "Error",
          description: error.message || "Failed to generate text",
          variant: "destructive",
        });
        return;
      }

      if (data?.generatedText) {
        send({ type: "GENERATION_SUCCESS", generatedText: data.generatedText });
        toast({
          title: "Success",
          description: "AI has continued your writing!",
        });
      } else {
        throw new Error("No generated text received");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      send({ type: "GENERATION_ERROR", error: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-[#d4d4d4]">
            AI Writing Assistant
          </h1>
          <p className="text-lg text-[#858585]">
            Start writing and let AI continue your thoughts with intelligent
            suggestions
          </p>
        </header>

        <div className="space-y-6">
          <CodeEditor
            content={state.context.content}
            onUpdate={(content) => send({ type: "UPDATE_CONTENT", content })}
            disabled={state.context.isGenerating || state.matches("previewing")}
          />

          {state.matches("previewing") && state.context.previewText && (
            <PreviewPanel
              originalText={state.context.content}
              generatedText={state.context.previewText}
              onAccept={() => send({ type: "ACCEPT_PREVIEW" })}
              onReject={() => send({ type: "REJECT_PREVIEW" })}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-[#858585]">
              {state.context.content.length} characters
            </div>

            <Button
              onClick={handleContinueWriting}
              disabled={
                state.context.isGenerating ||
                !state.context.content.trim() ||
                state.matches("previewing")
              }
              className="group relative overflow-hidden bg-[#007acc] px-8 py-6 text-lg font-medium text-white transition-all hover:bg-[#005a9e] hover:shadow-lg disabled:opacity-50 disabled:bg-[#3c3c3c]"
            >
              {state.context.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Continue Writing
                </>
              )}
            </Button>
          </div>

          {state.context.error && (
            <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-sm text-red-400">
              <p className="font-medium">Error:</p>
              <p>{state.context.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
