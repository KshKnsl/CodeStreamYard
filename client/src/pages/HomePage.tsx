import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import codeStreamYardLogo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MovingGradient } from "@/components/ui/moving-gradient";
import { PlayCircle, Users, MessageCircle } from "lucide-react";

export default function HomePage() {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroText = "Live code. Stream. Learn. Collaborate. All in one place.";

  useEffect(() => {
    if (currentIndex < heroText.length) {
      const timeout = setTimeout(() => {
        setTypedText(heroText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, heroText]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-black">
      {/* Background patterns */}
      <DotPattern
        width={40}
        height={40}
        cx={1}
        cy={1}
        cr={1.2}
        glow={true}
        className={cn("absolute inset-0 w-full h-full pointer-events-none z-0")}
      />
      <MovingGradient
        size={700}
        blur={180}
        speed={10}
        color1="rgba(147, 51, 234, 0.7)"
        color2="rgba(168, 85, 247, 0.5)"
        opacity={0.5}
        className="z-0"
      />
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-16 px-4">
        <img
          src={codeStreamYardLogo}
          alt="CodeStreamYard Logo"
          className="h-24 w-24 rounded-2xl shadow-xl mb-6"
        />
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            CodeStreamYard
          </span>
        </h1>
        <div className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium text-center mb-6 min-h-[2.5em]">
          {typedText}
          <span className="animate-pulse text-purple-500">|</span>
        </div>
        <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400 text-center mb-10">
          The platform for{" "}
          <span className="text-purple-600 dark:text-purple-400 font-semibold">
            live coding tutorials
          </span>
          , <span className="text-pink-600 dark:text-pink-400 font-semibold">real-time chat</span>,
          and{" "}
          <span className="text-purple-600 dark:text-purple-400 font-semibold">
            AI-powered code explanations
          </span>
          . Stream, learn, and collaborate interactively.
        </p>
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
          <div className="flex-1 bg-gray-100 dark:bg-[#18181b] rounded-xl p-6 shadow-md flex flex-col items-center">
            <PlayCircle className="w-10 h-10 text-purple-500 mb-2" />
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
              Live Coding Streams
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Broadcast your code in real time. Share your screen, terminal, and code editor with
              viewers.
            </p>
          </div>
          <div className="flex-1 bg-gray-100 dark:bg-[#18181b] rounded-xl p-6 shadow-md flex flex-col items-center">
            <Users className="w-10 h-10 text-pink-500 mb-2" />
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
              Interactive Sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Engage with your audience using real-time chat, Q&amp;A, and collaborative coding
              features.
            </p>
          </div>
          <div className="flex-1 bg-gray-100 dark:bg-[#18181b] rounded-xl p-6 shadow-md flex flex-col items-center">
            <MessageCircle className="w-10 h-10 text-purple-400 mb-2" />
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
              AI &amp; OCR Powered
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Get instant code explanations, suggestions, and OCR-based code updates during streams.
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-none shadow-md transform hover:scale-105 transition-all duration-300">
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 dark:bg-white/5 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-md transform hover:scale-105 transition-all duration-300">
            Watch Demo
          </Button>
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          &copy; {new Date().getFullYear()} CodeStreamYard. All rights reserved.
        </div>
      </div>
    </div>
  );
}
