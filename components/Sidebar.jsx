"use client";
import { useSidebar } from "@/contexts/SidebarContextProvider";
import { Menu, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useChat } from "@/contexts/ChatContextProvider";
import { groupConversations, truncateString } from "@/helpers/utils";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "@/contexts/AuthContextProvider";
import supabase from "@/lib/supabase";
import { BUTTON_LOADER } from "./Common/CommonButton";

export default function Sidebar() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // Add loading state
  const { isOpen, setIsOpen } = useSidebar();
  const {
    setConversationId,
    handleSetConversationId,
    conversationId,
    setMessages,
    isTyping,
  } = useChat();
  const { session } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [groupedConversations, setGroupedConversations] = useState({});
  const [totalConversations, setTotalConversations] = useState(0); // Track total records

  useEffect(() => {
    fetchConversations();
  }, [conversationId, session?.user?.id, page]);

  const fetchConversations = async () => {
    if (!session?.user?.id || loading) return; // Prevent fetching if already loading
    setLoading(true); // Set loading to true before making the request

    try {
      const { data, error, count } = await supabase
        .from("conversations")
        .select("*", { count: "exact" }) // Get the exact total count
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * 10, page * 10 - 1); // Add pagination logic

      if (error) throw error;

      if (data) {
        setTotalConversations(count); // Set the total number of conversations
        setConversations((prevConversations) => [
          ...prevConversations,
          ...data,
        ]); // Append new data to previous data
        const grouped = groupConversations(data);
        setGroupedConversations(grouped);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false); // Set loading to false after request is complete
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
    setConversationId(null);
    localStorage.removeItem("conversationId");
    setMessages([]);
    localStorage.removeItem("returnedId");
  };

  const groupLabels = {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "Previous 7 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    earlier: "Earlier",
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 bg-white border rounded px-3 py-2 shadow text-sm hover:bg-gray-100 z-50 flex items-center gap-1"
        >
          <Menu size={18} />
          Open Sidebar
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div
              id="scrollableDivId"
              className="fixed top-0 left-0 w-64 h-screen overflow-y-auto bg-white border-r px-3 py-4 text-sm z-50"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <button
                  className="text-muted-foreground hover:text-black text-lg"
                  title="Conversations"
                >
                  <Image
                    src={"/images/logo.png"}
                    width={90}
                    height={90}
                    alt="logo"
                  />
                </button>
                <div className="flex gap-2">
                  {conversations?.length ? (
                    <button
                      onClick={handleNewChat}
                      className="cursor-pointer text-muted-foreground hover:text-black text-lg"
                      title="New Chat"
                    >
                      <Plus size={20} />
                    </button>
                  ) : null}

                  <button
                    onClick={toggleSidebar}
                    className="cursor-pointer text-muted-foreground hover:text-black text-lg"
                    title="Close Sidebar"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <InfiniteScroll
                dataLength={Object.values(groupedConversations).reduce(
                  (acc, curr) => acc + curr.length,
                  0
                )}
                next={() => {
                  setPage((prev) => prev + 1);
                  console.log("Fetching more items...");
                }}
                hasMore={conversations.length < totalConversations} // Compare fetched data length with total
                loader={<p className="text-xs text-center">{BUTTON_LOADER}</p>}
                endMessage={
                  <p className="text-xs text-center text-muted-foreground"></p>
                }
                scrollableTarget="scrollableDivId"
              >
                {Object.entries(groupedConversations)
                  .filter(([, items]) => items.length > 0)
                  .map(([group, items]) => (
                    <div key={group} className="mb-6">
                      <p className="capitalize text-xs font-semibold text-muted-foreground mb-2">
                        {groupLabels[group] || group}
                      </p>
                      <ul className="space-y-1">
                        {items.map((conv) => (
                          <li
                            key={conv?.id}
                            className={`px-3 py-2 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
                              conversationId === conv?.id
                                ? "bg-gray-200 font-medium"
                                : ""
                            }`}
                            onClick={() => handleSetConversationId(conv?.id)}
                          >
                            <span className="truncate capitalize">
                              {truncateString(conv?.title) || "-"}
                            </span>

                            <div className="flex items-center gap-2">
                              {conv?.unread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              {isTyping &&
                                conversationId === conv?.id &&
                                BUTTON_LOADER}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </InfiniteScroll>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
