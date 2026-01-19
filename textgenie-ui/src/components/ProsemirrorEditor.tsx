import { useEffect, useRef } from 'react';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';

interface ProsemirrorEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
}

const ProsemirrorEditor = ({ content, onUpdate, disabled = false }: ProsemirrorEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdateRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create initial document from content
    const doc = basicSchema.node('doc', null, [
      basicSchema.node('paragraph', null, content ? [basicSchema.text(content)] : []),
    ]);

    // Create editor state
    const state = EditorState.create({
      doc,
      plugins: [
        history(),
        keymap({ 'Mod-z': undo, 'Mod-y': redo }),
        keymap(baseKeymap),
      ],
    });

    // Create editor view
    const view = new EditorView(editorRef.current, {
      state,
      editable: () => !disabled,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        // Only notify parent if this is a user-initiated change
        if (transaction.docChanged && !isExternalUpdateRef.current) {
          const textContent = newState.doc.textContent;
          onUpdate(textContent);
        }
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update editor content when prop changes (for AI-generated text)
  useEffect(() => {
    if (!viewRef.current) return;
    
    const currentContent = viewRef.current.state.doc.textContent;
    if (currentContent !== content) {
      // Mark this as an external update to prevent feedback loop
      isExternalUpdateRef.current = true;
      
      const doc = basicSchema.node('doc', null, [
        basicSchema.node('paragraph', null, content ? [basicSchema.text(content)] : []),
      ]);
      
      const state = EditorState.create({
        doc,
        plugins: viewRef.current.state.plugins,
      });
      
      viewRef.current.updateState(state);
      
      // Reset the flag after state update
      setTimeout(() => {
        isExternalUpdateRef.current = false;
      }, 0);
    }
  }, [content]);

  // Update editability
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.setProps({ editable: () => !disabled });
    }
  }, [disabled]);

  return (
    <div 
      ref={editorRef} 
      className="prosemirror-editor min-h-[400px] w-full rounded-lg border-2 border-editor-border bg-editor-bg p-6 transition-all duration-200 focus-within:border-editor-focus focus-within:shadow-lg"
      style={{
        fontSize: '16px',
        lineHeight: '1.6',
      }}
    />
  );
};

export default ProsemirrorEditor;
