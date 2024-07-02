import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user:null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  toggleDetail: false,
  selectedChat: null,
  changeChat: (chatId, user) => {
  const currentUser = useUserStore.getState().currentUser;

  // Check if User is Blocked
  if (user.blocked.includes(currentUser.id)){
    return set({
      chatId,
      user,
      isCurrentUserBlocked: true,
      isReceiverBlocked: false,
    })
  }
  // Check if Receiever is Blocked
  else if (currentUser.blocked.includes(user.id)){
    return set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: true,
    });
  }

  else{
    return set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  }
},

  changeBlock: () => {
    set((state) => ({...state, isReceiverBlocked:!state.isReceiverBlocked}));
  },

  // New method to toggle the detail state
  toggleDetailState: () => {
    set((state) => ({ toggleDetail: !state.toggleDetail }));
  },

  resetEverything: () => {
    set({
      chatId: null,
      user:null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
      toggleDetail: false,
    });
  },

  changeSelectedChat: (newChatId) =>{
    set({ selectedChat: newChatId});
  }
  
}));