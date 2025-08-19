import { useState } from 'react';

export const useSofiaChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const openChat = () => {
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsChatMinimized(false);
  };

  const toggleChatSize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  return {
    isChatOpen,
    isChatMinimized,
    openChat,
    closeChat,
    toggleChatSize,
  };
};
