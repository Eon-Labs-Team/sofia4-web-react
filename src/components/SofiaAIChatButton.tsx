import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare } from "lucide-react";
import { SofiaAIChat } from './SofiaAIChat';

export function SofiaAIChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          title="Chat Sofia AI"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat modal */}
      <SofiaAIChat 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
      />
    </>
  );
} 