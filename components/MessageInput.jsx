"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";

export default function MessageInput({ onSendMessage, isTyping }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit}         className="relative h-[48px] p-0 m-0"
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="overflow-auto w-full py-3 px-4 pr-12 bg-card rounded-full border border-[#e5e5e5] focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none max-h-32 h-[48px] hide-scrollbar"
          disabled={isTyping}
          rows={5}
        />
        <button
          type="submit"
          size="icon"
          className="cursor-pointer bg-[#171717] text-white hover:bg-primary/90 h-10 w-10 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
          disabled={!message.trim() || isTyping}
        >
          <SendHorizontal size={18} />
        </button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Not a substitute for professional mental health care
      </p>
    </motion.div>
  );
}
