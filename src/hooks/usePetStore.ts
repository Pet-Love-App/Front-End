import { create } from 'zustand';
import coldFactsData from '../../assets/cold_facts/ColdFacts.json';

// 提示语 - 出现频率较高
const TIP_MESSAGE = '长按可以将我隐藏哦~';

// 创建包含高频提示的消息列表
const createMessagesWithTip = () => {
  const messages: string[] = [];

  // 每3条冷知识插入一条提示
  coldFactsData.forEach((fact, index) => {
    messages.push(fact);
    if ((index + 1) % 3 === 0) {
      messages.push(TIP_MESSAGE);
    }
  });

  // 确保提示语在开头也出现
  if (messages[0] !== TIP_MESSAGE) {
    messages.unshift(TIP_MESSAGE);
  }

  return messages;
};

const allMessages = createMessagesWithTip();

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
  currentFact: allMessages[0],
  isTalking: true,
  isVisible: true,
  nextFact: () =>
    set((state) => {
      const nextIndex = (state.currentFactIndex + 1) % allMessages.length;
      return {
        currentFactIndex: nextIndex,
        currentFact: allMessages[nextIndex],
      };
    }),
  setTalking: (talking: boolean) => set({ isTalking: talking }),
  setVisible: (visible: boolean) => set({ isVisible: visible }),
}));
