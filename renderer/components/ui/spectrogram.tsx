import React, { useRef, useEffect, useState, useCallback } from "react";
import { Howl, Howler } from "howler";

interface SpectrogramProps {
  howl: Howl;
}

const Spectrogram: React.FC<SpectrogramProps> = ({ howl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const addDebugLog = useCallback(
    (message: string) => {
      if (isPlaying) {
        setDebugLogs((prev) => [
          ...prev,
          `${new Date().toISOString()}: ${message}`,
        ]);
        console.log(message);
      }
    },
    [isPlaying],
  );

  const setupAudio = useCallback(() => {
    addDebugLog("Setting up audio...");
    setIsSetup(false);

    try {
      const audioContext = Howler.ctx;
      if (!audioContext) {
        throw new Error("AudioContext not available");
      }
      addDebugLog("AudioContext created successfully");

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        addDebugLog("Disconnected existing analyser");
      }

      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      addDebugLog("AnalyserNode created successfully");

      const sound = howl as any;
      if (!sound._sounds || !sound._sounds[0] || !sound._sounds[0]._node) {
        throw new Error("Audio node not available");
      }
      addDebugLog("Howl audio node found");

      const audioNode = sound._sounds[0]._node;

      if (!audioNode.sourceNode) {
        audioNode.sourceNode = audioContext.createMediaElementSource(audioNode);
        addDebugLog("Created MediaElementSource for audio node");
      } else {
        addDebugLog("Using existing sourceNode for audio node");
      }

      audioNode.sourceNode.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
      addDebugLog(
        "Connected audio graph: sourceNode -> analyser -> destination",
      );

      setIsSetup(true);
      addDebugLog("Audio setup complete. isSetup set to true.");
    } catch (error) {
      addDebugLog(
        `Audio setup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      setIsSetup(false);
    }
  }, [howl, addDebugLog]);

  const drawSpectrogram = useCallback(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!isSetup || !analyserRef.current || !ctx || !canvas) {
      addDebugLog(
        `Draw failed: isSetup=${isSetup}, analyser=${!!analyserRef.current}, ctx=${!!ctx}, canvas=${!!canvas}`,
      );
      return;
    }

    animationRef.current = requestAnimationFrame(drawSpectrogram);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const barWidth = 1;
    const height = canvas.height;

    // Move the existing spectrogram to the left
    const imageData = ctx.getImageData(
      barWidth,
      0,
      canvas.width - barWidth,
      height,
    );
    ctx.putImageData(imageData, 0, 0);

    // Clear the rightmost column
    ctx.clearRect(canvas.width - barWidth, 0, barWidth, height);

    // Draw the new data
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = 1;
      const y = Math.floor(height - (i / bufferLength) * height);
      const intensity = dataArray[i];

      const r = Math.min(255, intensity * 2);
      const g = Math.min(255, intensity);
      const b = intensity / 2;

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(canvas.width - barWidth, y, barWidth, barHeight);
    }

    // Draw axes
    drawAxes(ctx, canvas);
  }, [isSetup, howl, addDebugLog, isPlaying]);

  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    ctx.save();
    ctx.clearRect(0, 0, 30, canvas.height);
    ctx.clearRect(0, canvas.height - 20, canvas.width, 20);

    ctx.fillStyle = "white";
    ctx.font = "10px Maven Pro";
    for (let i = 0; i <= 10; i++) {
      const freq = (i / 10) * 22.05;
      const y = canvas.height - (i / 10) * canvas.height;
      ctx.fillText(`${freq.toFixed(2)}`, 5, y);
    }

    const currentTime = howl.seek();
    ctx.fillText(
      `${currentTime.toFixed(1)}s`,
      canvas.width - 30,
      canvas.height - 5,
    );

    ctx.restore();
  };

  const startSpectrogram = useCallback(() => {
    addDebugLog("Starting spectrogram...");
    setupAudio();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      if (isSetup) {
        addDebugLog("Setup complete, starting to draw");
        drawSpectrogram();
      } else {
        addDebugLog("Setup not complete, unable to start drawing");
      }
    }, 100);
  }, [setupAudio, drawSpectrogram, isSetup]);

  const stopSpectrogram = useCallback(() => {
    addDebugLog("Stopping spectrogram...");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    addDebugLog("Component mounted");

    const initializeSpectrogram = () => {
      addDebugLog("Initializing spectrogram");
      addDebugLog(`Current Howl state: ${howl.state()}`);
      if (howl.state() === "loaded") {
        addDebugLog("Howl is already loaded");
        startSpectrogram();
      } else {
        addDebugLog("Howl is not loaded, waiting for load event");
        howl.once("load", () => {
          addDebugLog("Howl load event fired");
          startSpectrogram();
        });
      }
    };

    const handlePlay = () => {
      addDebugLog("Howl play event fired");
      setIsPlaying(true);
      startSpectrogram();
    };

    const handlePauseOrStop = () => {
      addDebugLog("Howl pause or stop event fired");
      setIsPlaying(false);
      stopSpectrogram();
    };

    howl.on("play", handlePlay);
    howl.on("pause", handlePauseOrStop);
    howl.on("stop", handlePauseOrStop);
    howl.on("end", handlePauseOrStop);

    initializeSpectrogram();

    return () => {
      addDebugLog("Component unmounting");
      stopSpectrogram();
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      howl.off("play", handlePlay);
      howl.off("pause", handlePauseOrStop);
      howl.off("stop", handlePauseOrStop);
      howl.off("end", handlePauseOrStop);
    };
  }, [howl, startSpectrogram, stopSpectrogram, addDebugLog]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="1315"
        height="400"
        className="antialiased"
      />
    </div>
  );
};

export default Spectrogram;
