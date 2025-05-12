"use client";

import { useSearchParams, useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("message");

  return <ChatInterface initialMessage={initialMessage} />;
}
