import { create } from 'zustand';
import { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
})); 