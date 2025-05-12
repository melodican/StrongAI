"use client";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useChat } from "@/contexts/ChatContextProvider";
import { useSidebar } from "@/contexts/SidebarContextProvider";
import { toastMessages } from "@/helpers/toastMessage";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { LogOut, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatHeader() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebar();
  const { signOut, session, setSession } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setMessages, setConversationId } = useChat();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    const res = await signOut();
    if (res.success) {
      router.push("/sign-in");
      localStorage.clear();
      Cookies.remove("sb-access-token");
      setMessages([]);
      setConversationId(null);
      setSession(null);
    } else {
      toastMessages(res?.error?.message || "Error signing out");
    }
  };

  const userEmail = session?.user?.email;
  const userInitial = userEmail?.[0]?.toUpperCase();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-[#e5e5e5] border-border"
      style={{
        height: "64px",
        border: "2px solid rgb(229, 229, 229)",
        opacity: 1,
        transform: "none",
        maxWidth: isOpen ? "calc(100% - 256px)" : "100%",
        width: "100%",
        marginLeft: "auto",
      }}
    >
      <div className="max-w-[85%] w-full mx-auto px-4 py-3 flex items-center justify-between">
        {!isOpen && (
          <button style={{ cursor: "pointer" }} onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
        )}
        <Link href="/" className="flex items-center space-x-2 text-primary">
          <Image src={"/images/logo.png"} width={90} height={90} alt="logo" />
        </Link>

        {userEmail && (
          <div className="flex items-center space-x-3">
            <button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full cursor-pointer"
            >
              <LogOut size={18} />
            </button>

            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
              {userInitial}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
