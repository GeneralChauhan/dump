import React, { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Check, X } from "lucide-react";

interface CodeEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
}

interface Suggestion {
  text: string;
  preview: string;
  confidence: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  onUpdate,
  disabled = false,
}) => {
  const [text, setText] = useState(content);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update local text when content prop changes
  useEffect(() => {
    setText(content);
  }, [content]);

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCursorPosition(e.target.selectionStart);
    onUpdate(newText);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce suggestion generation
    debounceRef.current = setTimeout(() => {
      generateSuggestions(newText, e.target.selectionStart);
    }, 500);
  };

  // Generate suggestions using the continue-writing API
  const generateSuggestions = async (text: string, cursorPos: number) => {
    if (!text.trim() || disabled) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "continue-writing",
        {
          body: { content: text },
        }
      );

      if (error) {
        console.error("Error generating suggestions:", error);
        return;
      }

      if (data?.generatedText) {
        const suggestion: Suggestion = {
          text: data.generatedText.trim(),
          preview: text + data.generatedText.trim(),
          confidence: 0.85,
        };
        setSuggestions([suggestion]);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(0);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle cursor position changes
  const handleCursorChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Tab":
        e.preventDefault();
        acceptSuggestion(suggestions[selectedSuggestionIndex]);
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      case "Enter":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          acceptSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
    }
  };

  // Accept a suggestion
  const acceptSuggestion = (suggestion: Suggestion) => {
    const newText = text + suggestion.text;
    setText(newText);
    onUpdate(newText);
    setShowSuggestions(false);
    setSuggestions([]);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  };

  // Reject suggestions
  const rejectSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Show preview of suggestion
  const showSuggestionPreview = (suggestion: Suggestion) => {
    setPreviewText(suggestion.preview);
    setShowPreview(true);
  };

  // Hide preview
  const hidePreview = () => {
    setShowPreview(false);
    setPreviewText("");
  };

  // Manual trigger for suggestions
  const triggerSuggestions = () => {
    if (text.trim()) {
      generateSuggestions(text, cursorPosition);
    }
  };

  return (
    <div className="relative">
      {/* Main Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorChange}
          onFocus={handleCursorChange}
          disabled={disabled}
          className="w-full min-h-[400px] p-6 font-mono text-sm leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] border border-[#3c3c3c] rounded-lg resize-none focus:outline-none focus:border-[#007acc] focus:ring-2 focus:ring-[#007acc]/20 transition-all duration-200"
          style={{
            fontFamily: 'Consolas, "Courier New", monospace',
            lineHeight: "1.6",
            tabSize: 2,
            padding: "20px 4rem",
          }}
          placeholder="Start writing your thoughts... Press Ctrl+Space for AI suggestions"
        />

        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#252526] border-r border-[#3c3c3c] rounded-l-lg flex flex-col items-center py-6 text-xs text-[#858585] font-mono select-none pointer-events-none">
          {text.split("\n").map((_, index) => (
            <div key={index} className="h-6 leading-6">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Manual Trigger Button */}
        <button
          onClick={triggerSuggestions}
          disabled={disabled || isGenerating || !text.trim()}
          className="absolute top-4 right-4 p-2 bg-[#007acc] hover:bg-[#005a9e] disabled:bg-[#3c3c3c] disabled:text-[#858585] text-white rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="text-xs">Suggest</span>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 cursor-pointer border-b border-[#3c3c3c] last:border-b-0 transition-colors duration-150 ${
                index === selectedSuggestionIndex
                  ? "bg-[#094771] text-white"
                  : "hover:bg-[#2a2d2e] text-[#d4d4d4]"
              }`}
              onClick={() => acceptSuggestion(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">AI Suggestion</div>
                  <div className="text-xs text-[#858585] mb-2">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </div>
                  <div className="text-sm">{suggestion.text}</div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showSuggestionPreview(suggestion);
                    }}
                    className="p-1 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
                    title="Preview"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptSuggestion(suggestion);
                    }}
                    className="p-1 hover:bg-green-600 rounded text-green-400 hover:text-white transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rejectSuggestions();
                    }}
                    className="p-1 hover:bg-red-600 rounded text-red-400 hover:text-white transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Instructions */}
          <div className="p-3 bg-[#1e1e1e] border-t border-[#3c3c3c] text-xs text-[#858585]">
            <div className="flex justify-between">
              <span>↑↓ to navigate</span>
              <span>Tab to accept</span>
              <span>Esc to dismiss</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-[#3c3c3c] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <button
                onClick={hidePreview}
                className="p-2 hover:bg-[#3c3c3c] rounded text-[#858585] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="font-mono text-sm leading-relaxed text-[#d4d4d4] whitespace-pre-wrap">
                {previewText}
              </div>
            </div>
            <div className="p-4 border-t border-[#3c3c3c] flex justify-end gap-2">
              <button
                onClick={hidePreview}
                className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const suggestion = suggestions[selectedSuggestionIndex];
                  if (suggestion) {
                    acceptSuggestion(suggestion);
                    hidePreview();
                  }
                }}
                className="px-4 py-2 bg-[#007acc] hover:bg-[#005a9e] text-white rounded transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
