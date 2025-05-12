"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// import { useAuth } from '@/components/AuthProvider';
import ChatInterface from "@/components/ChatInterface";
// import LoadingScreen from '@/components/LoadingScreen';

export default function ChatPage() {
  // const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("message");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If not loading and no user, redirect to home
    // if (!loading && !user) {
    //   setIsRedirecting(true);
    //   router.push('/');
    // }
  }, [router]);

  if (false) {
    return <LoadingScreen />;
  }

  return <ChatInterface initialMessage={initialMessage} />;
}
