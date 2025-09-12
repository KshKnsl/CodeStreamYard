import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge.tsx";
import { Tv, Square, Settings, Eye, Clock, Wifi } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface StreamBarProps {
  projectId: string;
}

export const StreamBar = ({ projectId }: StreamBarProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [streamStatus, setStreamStatus] = useState<"idle" | "connecting" | "live" | "error">(
    "idle"
  );
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamQuality, setStreamQuality] = useState("720p");
  const [bitrate, setBitrate] = useState("2500");

  // Timer for stream duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming && streamStatus === "live") {
      interval = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming, streamStatus]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartStream = async () => {
    if (!streamKey) {
      alert("Please enter your YouTube stream key");
      return;
    }

    setStreamStatus("connecting");
    setIsStreaming(true);

    try {
      const response = await fetch(`${SERVER_URL}/stream/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamKey,
          projectId,
          title: streamTitle,
          quality: streamQuality,
          bitrate,
        }),
      });

      if (response.ok) {
        setStreamStatus("live");
        setStreamDuration(0);
      } else {
        setStreamStatus("error");
        setIsStreaming(false);
      }
    } catch (error) {
      console.error("Stream start error:", error);
      setStreamStatus("error");
      setIsStreaming(false);
    }
  };

  const handleStopStream = async () => {
    try {
      await fetch(`${SERVER_URL}/stream/stop`, {
        method: "GET",
      });
      setIsStreaming(false);
      setStreamStatus("idle");
      setStreamDuration(0);
      setViewerCount(0);
    } catch (error) {
      console.error("Stream stop error:", error);
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
    <div className="bg-gray-900 text-white p-3 border-b border-gray-700">
      <div className="flex items-center justify-between max-w-full">
        {/* Left section - Stream status and basic info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <Badge variant="secondary" className="bg-gray-800 text-white">
              {getStatusText()}
            </Badge>
          </div>

          {isStreaming && streamStatus === "live" && (
            <>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Clock className="w-4 h-4" />
                {formatDuration(streamDuration)}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Eye className="w-4 h-4" />
                {viewerCount} viewers
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Wifi className="w-4 h-4" />
                {streamQuality} @ {bitrate}kbps
              </div>
            </>
          )}
        </div>

        {/* Center section - Stream title */}
        <div className="flex-1 mx-4">
          {streamTitle && (
            <div className="text-center text-sm font-medium truncate">{streamTitle}</div>
          )}
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center gap-2">
          {!isStreaming ? (
            <>
              <Input
                type="password"
                placeholder="YouTube Stream Key"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                className="w-48 bg-gray-800 border-gray-700 text-white"
              />
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Stream Settings</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Stream Title</Label>
                      <Input
                        id="title"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="Enter stream title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quality">Quality</Label>
                      <Select value={streamQuality} onValueChange={setStreamQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p (854x480)</SelectItem>
                          <SelectItem value="720p">720p (1280x720)</SelectItem>
                          <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                      <Select value={bitrate} onValueChange={setBitrate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1500">1500 kbps</SelectItem>
                          <SelectItem value="2500">2500 kbps</SelectItem>
                          <SelectItem value="3500">3500 kbps</SelectItem>
                          <SelectItem value="5000">5000 kbps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleStartStream}
                className="bg-red-600 hover:bg-red-700"
                disabled={!streamKey}>
                <Tv className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStopStream}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700">
              <Square className="w-4 h-4 mr-2" />
              End Stream
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
