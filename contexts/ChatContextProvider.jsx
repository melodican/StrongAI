"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContextProvider";
import { generateRandomId } from "@/helpers/utils";
import { FALLBACK_MESSAGE } from "@/constant";
import supabase from "@/lib/supabase";
const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const { session } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [fetchingChats, setFetchingChats] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const storedId = localStorage.getItem("conversationId");
    if (storedId && storedId !== "undefined" && storedId !== "null") {
      setConversationId(storedId);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [session?.user?.id, conversationId]);

  useEffect(() => {
    fetchConversations();
  }, [conversationId, session?.user?.id]);

  const createUserMessage = (content, isFallbackMessage = false) => {
    const userMessage = {
      content: isFallbackMessage ? FALLBACK_MESSAGE : content,
      is_from_user: isFallbackMessage ? false : true,
      user_id: session?.user?.id,
      optimistic_id: generateRandomId(),
    };
    return userMessage;
  };

  const saveUserMessageInDb = async (userMessage) => {
    const { optimistic_id, ...messageToSave } = userMessage;
    let finalConversationId;
    try {
      finalConversationId = conversationId;

      // If no conversation ID, create a new conversation
      if (!finalConversationId) {
        const { data: conversationData, error: conversationError } =
          await supabase
            .from("conversations")
            .insert([
              {
                user_id: session?.user?.id,
                title: userMessage.content?.slice(0, 50) || "New Conversation",
              },
            ])
            .select("id")
            .single();

        if (conversationError) throw conversationError;
        finalConversationId = conversationData?.id;
        handleSetConversationId(finalConversationId);
      }

      const { data: savedUserMessage, error: saveError } = await supabase
        .from("messages")
        .insert([
          {
            ...messageToSave,
            conversation_id: finalConversationId,
          },
        ])
        .select()
        .single();

      if (saveError) throw saveError;

      return {
        success: true,
        savedUserMessage,
        conversationId: finalConversationId,
      };
    } catch (error) {
      console.log(error, "Error saving message to database");
      return { success: false, error };
    }
  };

  const fetchMessages = async () => {
    if (!conversationId || !session?.user?.id) return;

    setFetchingChats(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log(data, "data inside fetch messages");
      if (data) setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setFetchingChats(false);
    }
  };

  const fetchConversations = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log(data, "conversations data");
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const handleSetConversationId = (id) => {
    setConversationId(id);
    localStorage.setItem("conversationId", id);
  };
  return (
    <div>
      <ChatContext.Provider
        value={{
          messages,
          setMessages,
          createUserMessage,
          saveUserMessageInDb,
          fetchingChats,
          conversationId,
          setConversationId,
          handleSetConversationId,
          conversations,
          setConversations,
          fetchingChats,
          isTyping,
          setIsTyping,
        }}
      >
        {children}
      </ChatContext.Provider>
    </div>
  );
};
export const useChat = () => {
  return useContext(ChatContext);
};

export default ChatContextProvider;
