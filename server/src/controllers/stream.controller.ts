import { Request, Response } from "express";
import { spawn } from "child_process";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";

let ffmpegProcess: any;

// Function to get FFmpeg path
function getFFmpegPath(): string {
  // Try ffmpeg-static first
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch (error) {
    // ffmpeg-static not available
  }

  // Try local bin directory
  const localBinPath = path.join(__dirname, '../../bin/ffmpeg' + (process.platform === 'win32' ? '.exe' : ''));
  if (fs.existsSync(localBinPath)) {
    return localBinPath;
  }

  // Fall back to system ffmpeg
  return 'ffmpeg';
}

export class StreamController {
  static io: Server;

  static startStream(req: Request, res: Response) {
    const { streamKey, projectId, title, quality = "720p", bitrate = "2500" } = req.body;
    if (!streamKey) {
      return res.status(400).send("Stream key is required");
    }

    const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${streamKey}`;
    const ffmpegPath = getFFmpegPath();

    console.log(`Using FFmpeg from: ${ffmpegPath}`);

    ffmpegProcess = spawn(ffmpegPath, [
      // Input video
      "-f",
      "gdigrab",
      "-framerate",
      "30",
      "-video_size",
      quality === "1080p" ? "1920x1080" : quality === "480p" ? "854x480" : "1280x720",
      "-i",
      "desktop",
      // Input audio (silent)
      "-f",
      "lavfi",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=48000",
      // Video encoding
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",
      "-profile:v",
      "baseline",
      "-level",
      "3.1",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-g",
      "60",
      "-keyint_min",
      "60",
      "-sc_threshold",
      "0",
      "-b:v",
      `${bitrate}k`,
      "-maxrate",
      `${parseInt(bitrate) * 1.2}k`,
      "-bufsize",
      `${parseInt(bitrate) * 2}k`,
      // Audio encoding
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-ac",
      "2",
      // Streaming specific
      "-avoid_negative_ts",
      "make_zero",
      "-fflags",
      "+genpts",
      "-f",
      "flv",
      rtmpUrl,
    ]);

    ffmpegProcess.stderr.on("data", (data: any) => {
      console.log(`ffmpeg: ${data}`);
      if (StreamController.io) {
        StreamController.io.emit("streamData", data.toString());
      }
    });

    ffmpegProcess.on("close", (code: any) => {
      console.log(`ffmpeg process exited with code ${code}`);
      if (StreamController.io) {
        StreamController.io.emit("streamEnd", `Stream ended with code ${code}`);
      }
    });

    res.status(200).send("Streaming started");
  }

  static stopStream(req: Request, res: Response) {
    if (ffmpegProcess) {
      ffmpegProcess.kill("SIGINT");
      ffmpegProcess = null;
      res.status(200).send("Streaming stopped");
    } else {
      res.status(404).send("No active stream to stop");
    }
  }
}
