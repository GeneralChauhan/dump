import { createMachine, assign } from 'xstate';

export interface EditorContext {
  content: string;
  isGenerating: boolean;
  error: string | null;
  previewText: string | null;
}

export type EditorEvent =
  | { type: 'UPDATE_CONTENT'; content: string }
  | { type: 'CONTINUE_WRITING' }
  | { type: 'GENERATION_SUCCESS'; generatedText: string }
  | { type: 'GENERATION_ERROR'; error: string }
  | { type: 'ACCEPT_PREVIEW' }
  | { type: 'REJECT_PREVIEW' }
  | { type: 'RESET_ERROR' };

export const editorMachine = createMachine({
  id: 'editor',
  initial: 'idle',
  context: {
    content: '',
    isGenerating: false,
    error: null,
    previewText: null,
  } as EditorContext,
  states: {
    idle: {
      on: {
        UPDATE_CONTENT: {
          actions: assign({
            content: ({ event }) => event.content,
          }),
        },
        CONTINUE_WRITING: {
          target: 'generating',
        },
      },
    },
    generating: {
      entry: assign({
        isGenerating: true,
        error: null,
        previewText: null,
      }),
      on: {
        GENERATION_SUCCESS: {
          target: 'previewing',
          actions: assign({
            previewText: ({ event }) => event.generatedText,
            isGenerating: false,
          }),
        },
        GENERATION_ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
            isGenerating: false,
          }),
        },
      },
    },
    previewing: {
      on: {
        ACCEPT_PREVIEW: {
          target: 'idle',
          actions: assign({
            content: ({ context }) => context.content + (context.previewText || ''),
            previewText: null,
          }),
        },
        REJECT_PREVIEW: {
          target: 'idle',
          actions: assign({
            previewText: null,
          }),
        },
      },
    },
    error: {
      on: {
        CONTINUE_WRITING: {
          target: 'generating',
        },
        RESET_ERROR: {
          target: 'idle',
          actions: assign({
            error: null,
          }),
        },
      },
    },
  },
});
