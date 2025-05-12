"use client";

import { formatTime } from "@/helpers/utils";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Message({ message, isSequential }) {
  const { content, is_from_user, created_at } = message;
  console.log(message, "message inside message comp");

  const formattedTime = created_at ? formatTime(created_at, "h:mm a") : "";
  console.log(formattedTime, "formattedTime");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${is_from_user ? "justify-end" : "justify-start"} ${
        isSequential ? "mt-2" : "mt-6"
      }`}
    >
      {!is_from_user && !isSequential && (
        <div className="flex w-[40px] h-[40px] items-center justify-center rounded-full bg-[#1717171a] text-black mr-3 mt-1">
          <Image
            src="/images/avatar.jpg"
            className="w-[40px] h-[40px] rounded-full object-cover"
            height={50}
            width={50}
          />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[70%] ${
          !is_from_user && isSequential ? "ml-11" : ""
        }`}
      >
        {!isSequential && !is_from_user && (
          <div className="mb-1 ml-1 text-xs text-muted-foreground">Mia</div>
        )}

        <div
          className={`px-4 py-3 rounded-2xl text-sm ${
            !is_from_user
              ? "bg-muted rounded-tl-none"
              : "bg-black text-white rounded-tr-none"
          }`}
          style={!is_from_user ? { background: "#f5f5f5" } : {}}
        >
          <div className="whitespace-pre-line">{content}</div>
        </div>

        <div
          className={`text-xs text-muted-foreground mt-1 ${
            !is_from_user ? "text-right mr-1" : "ml-1"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </motion.div>
  );
}
