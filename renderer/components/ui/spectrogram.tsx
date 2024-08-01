import React, { useRef, useEffect, useState, useCallback } from "react";
import { Howl, Howler } from "howler";

interface SpectrogramProps {
  howl: Howl;
}

const Spectrogram: React.FC<SpectrogramProps> = ({ howl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const LEFT_MARGIN = 20; // Space for y-axis labels
  const AXIS_RIGHT_PADDING = 30; // Space between y-axis labels and graph

  const setupAudio = useCallback(() => {
    setIsSetup(false);

    try {
      const audioContext = Howler.ctx;
      if (!audioContext) {
        throw new Error("AudioContext not available");
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }

      analyserRef.current = audioContext.createAnalyser();

      const sound = howl as any;
      if (!sound._sounds || !sound._sounds[0] || !sound._sounds[0]._node) {
        throw new Error("Audio node not available");
      }

      const audioNode = sound._sounds[0]._node;

      if (!audioNode.sourceNode) {
        audioNode.sourceNode = audioContext.createMediaElementSource(audioNode);
      }

      audioNode.sourceNode.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);

      setIsSetup(true);
    } catch (error) {
      setIsSetup(false);
    }
  }, [howl]);

  const drawSpectrogram = useCallback(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!isSetup || !analyserRef.current || !ctx || !canvas) {
      return;
    }

    animationRef.current = requestAnimationFrame(drawSpectrogram);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const barWidth = 1;
    const height = canvas.height - 20;
    const graphStart = LEFT_MARGIN + AXIS_RIGHT_PADDING;

    const imageData = ctx.getImageData(
      graphStart + barWidth,
      0,
      canvas.width - graphStart - barWidth,
      height,
    );
    ctx.putImageData(imageData, graphStart, 0);

    ctx.clearRect(canvas.width - barWidth, 0, barWidth, height);

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

    drawAxes(ctx, canvas);
  }, [isSetup, howl, isPlaying]);

  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    ctx.save();
    ctx.clearRect(0, 0, LEFT_MARGIN + AXIS_RIGHT_PADDING, canvas.height);
    ctx.clearRect(0, canvas.height - 20, canvas.width, 20);

    ctx.fillStyle = "white";
    ctx.font = "10.5px Maven Pro";
    for (let i = 0; i <= 10; i++) {
      const freq = (i / 10) * 22.05;
      const y = canvas.height - 20 - (i / 10) * (canvas.height - 20);
      ctx.fillText(`${freq.toFixed(2)}k`, 5, y);
    }

    const currentTime = howl.seek();
    ctx.fillText(
      `Time: ${currentTime.toFixed(1)}s`,
      canvas.width / 2,
      canvas.height,
    );

    ctx.restore();
  };

  const startSpectrogram = useCallback(() => {
    setupAudio();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      if (isSetup) {
        drawSpectrogram();
      }
    }, 100);
  }, [setupAudio, drawSpectrogram, isSetup]);

  const stopSpectrogram = useCallback(() => {
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

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }, []);

  useEffect(() => {
    const initializeSpectrogram = () => {
      if (howl.state() === "loaded") {
        startSpectrogram();
      } else {
        howl.once("load", startSpectrogram);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startSpectrogram();
    };

    const handlePauseOrStop = () => {
      setIsPlaying(false);
      stopSpectrogram();
    };

    howl.on("play", handlePlay);
    howl.on("pause", handlePauseOrStop);
    howl.on("end", handlePauseOrStop);

    initializeSpectrogram();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      stopSpectrogram();
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      howl.off("play", handlePlay);
      howl.off("pause", handlePauseOrStop);
      howl.off("end", handlePauseOrStop);
      resizeObserver.disconnect();
    };
  }, [howl, startSpectrogram, stopSpectrogram, resizeCanvas]);

  return (
    <div ref={containerRef} className="h-full w-full rounded-2xl px-6 pb-8">
      <canvas ref={canvasRef} className="h-full w-full antialiased" />
    </div>
  );
};

export default Spectrogram;
