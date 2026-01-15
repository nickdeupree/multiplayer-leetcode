import * as Y from 'yjs';

export type InitCollabOptions = {
  editor: any;
  monaco?: any;
  initialCode?: string | null;
  roomName?: string;
  websocketUrl?: string;
  onCodeChange?: (code: string) => void;
  onExecutionStateChange?: (state: ExecutionState) => void;
  onResultsChange?: (results: ExecutionResults) => void;
};

export type ExecutionState = {
  isRunning: boolean;
  isSubmitting: boolean;
  showResults: boolean;
  selectedTestCase: number;
};

export type ExecutionResults = {
  runResult: any | null;
  submitResult: any | null;
};

export type CollabHandle = {
  ydoc: Y.Doc;
  provider: any;
  binding: any;
  executionState: Y.Map<any>;
  executionResults: Y.Map<any>;
  setExecutionState: (state: Partial<ExecutionState>) => void;
  setExecutionResults: (results: Partial<ExecutionResults>) => void;
  cleanup: () => Promise<void>;
};

export async function initCollaboration({
  editor,
  monaco,
  initialCode,
  roomName,
  websocketUrl,
  onCodeChange,
  onExecutionStateChange,
  onResultsChange,
}: InitCollabOptions): Promise<CollabHandle> {
  const ydoc = new Y.Doc();
  const yText = ydoc.getText('monaco');

  // Seed initial content if empty
  if (yText.toString() === '' && initialCode) {
    yText.insert(0, initialCode);
  }

  // Create shared maps for execution state and results
  const executionState = ydoc.getMap('executionState');
  const executionResults = ydoc.getMap('executionResults');

  // Dynamic imports to avoid loading on server
  const { WebsocketProvider } = await import('y-websocket');
  const { MonacoBinding } = await import('y-monaco');

  const provider = new WebsocketProvider(
    websocketUrl ?? 'ws://localhost:1234',
    roomName ?? 'monaco',
    ydoc
  );

  // Awareness - used by y-monaco to show remote cursors
  const hue = Math.floor(Math.random() * 360);
  const clientColor = `hsl(${hue}, 100%, 50%)`;
  const clientName = `User-${Math.floor(Math.random() * 1000)}`;

  provider.awareness.setLocalStateField('user', {
    name: clientName,
    color: clientColor,
  });

  const binding = new MonacoBinding(
    yText,
    editor.getModel(),
    new Set([editor]),
    provider.awareness
  );

  // Observer to update consumers of the collab module
  const observer = () => {
    const newCode = yText.toString();
    if (onCodeChange) onCodeChange(newCode);
  };
  yText.observe(observer);
  (binding as any)._yTextObserver = observer;

  // Observer for execution state changes
  const executionStateObserver = () => {
    if (onExecutionStateChange) {
      const state: ExecutionState = {
        isRunning: (executionState.get('isRunning') as boolean) ?? false,
        isSubmitting: (executionState.get('isSubmitting') as boolean) ?? false,
        showResults: (executionState.get('showResults') as boolean) ?? false,
        selectedTestCase: (executionState.get('selectedTestCase') as number) ?? 0,
      };
      onExecutionStateChange(state);
    }
  };
  executionState.observe(executionStateObserver);

  // Observer for execution results changes
  const executionResultsObserver = () => {
    if (onResultsChange) {
      const results: ExecutionResults = {
        runResult: executionResults.get('runResult') ?? null,
        submitResult: executionResults.get('submitResult') ?? null,
      };
      onResultsChange(results);
    }
  };
  executionResults.observe(executionResultsObserver);

  const awarenessObserver = (changes: any, origin: string) => {
    // Keep a lightweight debug hook here
    console.log('Awareness change detected:', changes, 'Origin:', origin);
  };
  provider.awareness.on('change', awarenessObserver);

  // Helper functions to update shared state
  const setExecutionState = (state: Partial<ExecutionState>) => {
    Object.entries(state).forEach(([key, value]) => {
      executionState.set(key, value);
    });
  };

  const setExecutionResults = (results: Partial<ExecutionResults>) => {
    Object.entries(results).forEach(([key, value]) => {
      executionResults.set(key, value);
    });
  };

  async function cleanup() {
    try {
      const yTextLocal = ydoc.getText('monaco');
      yTextLocal.unobserve(observer);
      executionState.unobserve(executionStateObserver);
      executionResults.unobserve(executionResultsObserver);
      binding.destroy();
      provider.disconnect();
      provider.destroy?.();
      ydoc.destroy();
    } catch (e) {
      console.warn('Error during Yjs cleanup', e);
    }
  }

  return {
    ydoc,
    provider,
    binding,
    executionState,
    executionResults,
    setExecutionState,
    setExecutionResults,
    cleanup,
  };
}
