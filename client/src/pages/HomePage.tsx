import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import codeStreamYardLogo from "@/assets/logo.png";
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
    <div className="relative h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-black dark:to-purple-950">
      <MovingGradient
        size={700}
        blur={180}
        speed={10}
        color1="rgba(147, 51, 234, 0.3)"
        color2="rgba(168, 85, 247, 0.2)"
        opacity={0.4}
        className="z-0"
      />
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <img
            src={codeStreamYardLogo}
            alt="CodeStreamYard Logo"
            className="h-20 w-20 rounded-2xl mb-8 mx-auto"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-purple-400 dark:via-purple-300 dark:to-pink-400">
              CodeStreamYard
            </span>
          </h1>
          <div className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium mb-2 min-h-[3em]">
            {typedText}
            <span className="animate-pulse text-purple-500">|</span>
          </div>
          <p className="max-w-2xl mx-auto text-base text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
            The platform for{" "}
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              live coding tutorials
            </span>
            , <span className="text-pink-600 dark:text-pink-400 font-semibold">real-time chat</span>
            , and{" "}
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              collaborative development
            </span>
            .
          </p>
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-900/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                <PlayCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Live Coding</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Broadcast your code in real time with screen sharing and terminal access.
              </p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100 dark:border-pink-900/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                Interactive Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Real-time chat, Q&A, and collaborative coding with your audience.
              </p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-900/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">AI Powered</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Instant code explanations and OCR-based updates during streams.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-3">
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/20 dark:bg-black/20 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-3">
            Watch Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
