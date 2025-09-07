import React, { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon, Play } from "lucide-react";

interface TerminalProps {
  className?: string;
  projectId?: string;
}

const Terminal: React.FC<TerminalProps> = ({ className = "" }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = async () => {
    setOutput(["No command available. Command functionality has been removed."]);
  };

  return (
    <div
      className={`h-full flex flex-col bg-black dark:bg-black text-green-400 font-mono text-sm ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#171717] dark:bg-[#171717] border-b border-gray-600 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 bg-green-700 hover:bg-green-800 text-white rounded text-xs disabled:opacity-50"
          onClick={handleRun}
          disabled={true}>
          <Play className="w-3 h-3" />
          Run
        </button>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {output.length === 0 ? (
          <div className="text-gray-400">Command output will appear here.</div>
        ) : (
          output.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap text-gray-300 ml-0">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Terminal;
