import { create } from 'zustand';
import coldFactsData from '../../assets/cold_facts/ColdFacts.json';

interface PetState {
  currentFactIndex: number;
  currentFact: string;
  isTalking: boolean;
  isVisible: boolean;
  nextFact: () => void;
  setTalking: (talking: boolean) => void;
  setVisible: (visible: boolean) => void;
}

export const usePetStore = create<PetState>((set) => ({
  currentFactIndex: 0,
  currentFact: coldFactsData[0],
  isTalking: true,
  isVisible: true,
  nextFact: () =>
    set((state) => {
      const nextIndex = (state.currentFactIndex + 1) % coldFactsData.length;
      return {
        currentFactIndex: nextIndex,
        currentFact: coldFactsData[nextIndex],
      };
    }),
  setTalking: (talking: boolean) => set({ isTalking: talking }),
  setVisible: (visible: boolean) => set({ isVisible: visible }),
}));
