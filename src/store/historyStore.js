import { create } from 'zustand';

export const useHistoryStore = create((set, get) => ({
  undoStack: [],
  redoStack: [],

  executeCommand: (command) => {
    command.execute();
    set((state) => {
      const newUndo = [...state.undoStack, command];
      if (newUndo.length > 100) {
        newUndo.shift(); // Keep max 100
      }
      return {
        undoStack: newUndo,
        redoStack: [] // Clear redo stack on new command
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      
      const newUndo = [...state.undoStack];
      const command = newUndo.pop();
      command.undo();
      
      return {
        undoStack: newUndo,
        redoStack: [...state.redoStack, command]
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      
      const newRedo = [...state.redoStack];
      const command = newRedo.pop();
      command.execute();
      
      return {
        undoStack: [...state.undoStack, command],
        redoStack: newRedo
      };
    });
  },
  
  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
  clearHistory: () => set({ undoStack: [], redoStack: [] })
}));
