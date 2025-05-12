"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex mt-6"
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        <div className="h-8 w-8">
          <div className="bg-primary/10 text-primary">
            {/* <Brain size={16} /> */}
            <Image
              src="/images/avatar.jpg"
              className="w-[40px] h-[40px] rounded-full object-cover"
              height={50}
              width={50}
              alt="Mia"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[85%] md:max-w-[70%]">
        <div className="mb-1 ml-1 text-xs text-muted-foreground">Mia</div>

        <div
          className="px-4 py-3 rounded-2xl text-sm bg-muted rounded-tl-none"
          style={{ background: "#f5f5f5" }}
        >
          <div className="flex space-x-1 items-center">
            <motion.span
              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
              style={{ background: "#73737380" }}
            />
            <motion.span
              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              style={{ background: "#73737380" }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.4,
                delay: 0.2,
              }}
            />
            <motion.span
              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              style={{ background: "#73737380" }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.4,
                delay: 0.4,
              }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-1 ml-1">typing...</div>
      </div>
    </motion.div>
  );
}
