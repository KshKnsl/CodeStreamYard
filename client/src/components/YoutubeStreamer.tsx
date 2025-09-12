import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tv, Square, Settings, AlertCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface YoutubeStreamerProps {
  onStreamStatusChange?: (status: "idle" | "connecting" | "live" | "error") => void;
  projectId?: string;
}

export const YoutubeStreamer = ({ onStreamStatusChange, projectId }: YoutubeStreamerProps) => {
  const [streamKey, setStreamKey] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<"idle" | "connecting" | "live" | "error">(
    "idle"
  );
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    // Listen for stream events
    newSocket.on("streamData", (data: string) => {
      setStreamLogs((prev) => [...prev.slice(-10), data]); // Keep last 10 logs
    });

    newSocket.on("streamEnd", (message: string) => {
      setStreamLogs((prev) => [...prev, message]);
      setIsStreaming(false);
      setStreamStatus("idle");
      onStreamStatusChange?.("idle");
    });

    return () => {
      newSocket.close();
    };
  }, [onStreamStatusChange]);

  useEffect(() => {
    onStreamStatusChange?.(streamStatus);
  }, [streamStatus, onStreamStatusChange]);

  const handleStream = async () => {
    if (isStreaming) {
      // Stop stream
      setStreamStatus("idle");
      await fetch(`${SERVER_URL}/stream/stop`);
      setIsStreaming(false);
      setStreamLogs([]);
    } else {
      // Start stream
      if (!streamKey) {
        alert("Please enter your YouTube stream key");
        return;
      }

      setStreamStatus("connecting");
      setIsStreaming(true);
      setStreamLogs([]);

      try {
        const response = await fetch(`${SERVER_URL}/stream/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamKey, projectId }),
        });

        if (response.ok) {
          setStreamStatus("live");
        } else {
          const error = await response.text();
          setStreamStatus("error");
          setStreamLogs((prev) => [...prev, `Error: ${error}`]);
        }
      } catch (error) {
        setStreamStatus("error");
        setStreamLogs((prev) => [...prev, `Connection error: ${error}`]);
      }
    }
  };

  const getStatusColor = () => {
    switch (streamStatus) {
      case "live":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (streamStatus) {
      case "live":
        return "LIVE";
      case "connecting":
        return "CONNECTING";
      case "error":
        return "ERROR";
      default:
        return "OFFLINE";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <Badge variant="secondary">{getStatusText()}</Badge>
      </div>

      <div className="space-y-3">
        <Input
          type="password"
          placeholder="Enter your YouTube stream key"
          value={streamKey}
          onChange={(e) => setStreamKey(e.target.value)}
          disabled={isStreaming}
        />

        <Button
          onClick={handleStream}
          className={`w-full ${isStreaming ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isStreaming ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Streaming
            </>
          ) : (
            <>
              <Tv className="w-4 h-4 mr-2" />
              Start Streaming
            </>
          )}
        </Button>
      </div>

      {/* Stream logs */}
      {streamLogs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Stream Logs
          </h4>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md max-h-32 overflow-y-auto">
            {streamLogs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {streamStatus === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">
            Stream failed to start. Check your stream key and try again.
          </span>
        </div>
      )}
    </div>
  );
};
