"use client";

import { motion, AnimatePresence } from "framer-motion";
import Message from "@/components/Message";
import TypingIndicator from "@/components/TypingIndicator";
import Image from "next/image";

export default function MessageList({ messages, isTyping, messagesEndRef }) {
  const showWelcome = messages.length === 0 && !isTyping;
  console.log(messages, "messagedasdas");
  const isMessages = messages?.length;

  return (
    <div className="space-y-6">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center ${isMessages ? "pt-8" : ""} mb-0`}
        >
          <div className="mb-4">
            <Image
              src="/images/logo.png"
              alt="Strong AI Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          <div className="mb-2 relative">
            <Image
              src="/images/avatar.jpg"
              alt="Mia"
              width={64}
              height={64}
              className="rounded-full mx-auto w-[120px] h-[120px] object-cover rounded-full"
            />
            <div className="flex items-center justify-center gap-2 d-inline-block w-[max-content] bg-white px-4 rounded-[30px] border border-[#ccc] mx-auto mt-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-green-700 font-medium">
                You're connected to Mia
              </span>
            </div>
          </div>

          <h2 className="text-[34px] font-bold text-primary mb-3">
            What's on your mind?{" "}
          </h2>
          <p className="text-muted-foreground mb-4">
            Type below and let's talk about it
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {messages.length > 0 &&
          messages.map((message, index) => (
            <Message
              key={message?.id || message?.optimistic_id || index}
              message={message}
              isSequential={
                index > 0 &&
                messages[index - 1]?.is_from_user === message?.is_from_user
              }
            />
          ))}
      </AnimatePresence>

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
