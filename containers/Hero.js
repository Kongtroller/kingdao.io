//containers\Hero.js
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const arrowOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
<section
  ref={targetRef}
  className="relative h-screen min-h-[90vh] flex items-center justify-center w-full overflow-x-hidden px-4 bg-slate-50 dark:bg-gray-950 pt-20"
  style={{
    backgroundImage: `url('/banner.jpg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
<div className="relative z-10 flex justify-center items-center">
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7 }}
    className="bg-white/70 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-2xl mx-auto text-center"
  >
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-primary/90 dark:text-sky-400"
    >
      Welcome to&nbsp;
      <span className="bg-gradient-to-r from-red-950 via-red-900 to-red-700 bg-clip-text text-transparent">
        KingDAO 
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mt-6 text-muted-foreground text-sm sm:text-lg lg:text-xl font-light max-w-2xl mx-auto"
    >
      Web3 dashboard for Kong NFT holders
    </motion.p>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="mt-10"
    >
      <Button
        asChild
        size="lg"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium bg-gradient-to-br from-black to-red-500 hover:opacity-90 shadow-lg transition"
      >
        <Link href="/dashboard">Open Dashboard</Link>
      </Button>
    </motion.div>
  </motion.div>
</div>

  <motion.div
    style={{ opacity: arrowOpacity }}
    initial={{ y: 0 }}
    animate={{ y: [0, -10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-200/70"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  </motion.div>
</section>

  );
}
