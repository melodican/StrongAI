"use client";
import { useEffect, useRef } from "react";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import ChatHeader from "@/components/ChatHeader";
import { motion } from "framer-motion";
import { useChat } from "@/contexts/ChatContextProvider";
import { toastMessages } from "@/helpers/toastMessage";
import { useAuth } from "@/contexts/AuthContextProvider";
import PageLoader from "./PageLoader";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContextProvider";

export default function ChatInterface({ initialMessage }) {
  const { session } = useAuth();
  const { isOpen } = useSidebar();
  const {
    messages,
    setMessages,
    createUserMessage,
    saveUserMessageInDb,
    handleSetConversationId,
    setIsTyping,
    isTyping,
  } = useChat();
  console.log(messages, "these are messages");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = createUserMessage(text);
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping((prev) => true);
    let saveUserDbResponse;
    try {
      saveUserDbResponse = await saveUserMessageInDb(userMessage);
      if (saveUserDbResponse?.success) {
        const { savedUserMessage } = saveUserDbResponse;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.optimistic_id === userMessage.optimistic_id
              ? savedUserMessage
              : msg
          )
        );
      } else {
        toastMessages(
          saveUserDbResponse?.error?.message ||
            "Something went wrong while saving the message."
        );
      }
    } catch (error) {
      toastMessages(error?.message || DEFAULT_ERROR_MESSAGE);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId: session?.user?.id,
          conversationId: saveUserDbResponse?.conversationId,
        }),
      });
      console.log(response, "this is response");

      if (response?.error) {
        throw new Error("Failed to get AI response");
      }

      const res = await response.json();
      console.log(res, "ai message outside");
      handleSetConversationId(res?.conversationId);
      setMessages((prev) => [...prev, res?.response]);
    } catch (error) {
      console.error("Error sending message:", error);
      const fallbackMessage = createUserMessage(text, true);
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  console.log(messages, "these are messages");

  const isMessages = messages?.length > 0;
  console.log(messages?.length, "messages length");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white"
    >
      {false ? (
        <PageLoader />
      ) : (
        <>
          {isOpen ? <Sidebar /> : ""}
          <ChatHeader />
          <div
            style={{
              height: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: isOpen ? "calc(100% - 256px)" : "100%",
              marginLeft: messages?.length ? "" : "auto",
              marginTop: messages?.length ? "" : "auto",
              marginBottom: messages?.length ? "" : "auto",
              width: "100%",
              marginLeft: "auto",
            }}
          >
            <div
              className={`overflow-y-auto px-4 ${
                isMessages ? "py-6" : "-mt-[56px]"
              }  md:px-6`}
            >
              <div
                className={`max-w-[85%] w-full ${
                  isMessages ? "mx-auto" : "mx-auto"
                }`}
              >
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  messagesEndRef={messagesEndRef}
                />
              </div>
            </div>
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="max-w-[85%] w-full mx-auto">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
