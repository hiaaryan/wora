import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Slider } from "@/components/ui/slider";
import { IAudioMetadata } from "music-metadata-browser";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
} from "@tabler/icons-react";
interface trayData {
  play?: boolean;
  seek: number;
  duration?: number;
  metadata?: IAudioMetadata;
  cover?: string;
}

export default function Tray() {
  const [trayData, setTrayData] = useState<trayData | null>({
    play: false,
    seek: 0,
    duration: 0,
    metadata: null,
    cover: "https://iili.io/HlHy9Yx.png",
  });

  const handlePlayPause = () => {
    window.ipc.send("tray-command", { type: "play", play: !trayData.play });
    setTrayData((prevTrayData) => ({
      ...prevTrayData,
      play: !prevTrayData.play,
    }));
  };

  const handleSeek = (value: number[]) => {
    window.ipc.send("tray-command", { type: "seek", seek: value });
    setTrayData((prevTrayData) => ({
      ...prevTrayData,
      seek: value[0],
    }));
  };

  useEffect(() => {
    window.ipc.on("tray-update", (data: trayData) => {
      setTrayData((prevTrayData) => ({
        ...prevTrayData,
        ...data,
      }));
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Tray</title>
      </Head>
      <div className="h-screen w-screen select-none overflow-hidden bg-white/80 p-5 text-xs text-black antialiased dark:bg-neutral-900/80 dark:text-white">
        <div className="flex h-full w-full items-center">
          <div className="flex h-full w-full flex-col items-center justify-between gap-4">
            <div className="flex h-full w-full items-center gap-6">
              <div className="flex h-full w-1/3 items-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-md transition duration-500">
                  {trayData && trayData.cover && (
                    <Image
                      alt="album"
                      src={trayData && trayData.cover}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="flex h-full w-2/3 flex-col items-start justify-around overflow-hidden">
                <div className="w-full origin-left scale-95 gradient-mask-r-70">
                  <p className="text-nowrap text-sm">
                    {trayData.metadata
                      ? trayData.metadata.common.title
                      : "Echoes of Emptiness"}
                  </p>
                  <p className="text-nowrap opacity-50">
                    {trayData.metadata
                      ? trayData.metadata.common.artist
                      : "The Void Ensemble"}
                  </p>
                </div>
                <Slider
                  defaultValue={[0]}
                  value={[trayData && trayData.seek]}
                  onValueChange={handleSeek}
                  max={trayData && trayData.duration}
                  step={0.01}
                />
                <div className="-ml-2 flex w-full items-center justify-center gap-8">
                  <Button variant="ghost">
                    <IconPlayerSkipBack
                      stroke={2}
                      className="h-4 fill-black dark:fill-white"
                    />
                  </Button>
                  <Button variant="ghost" onClick={handlePlayPause}>
                    {trayData && !trayData.play ? (
                      <IconPlayerPlay
                        stroke={2}
                        className="h-6 w-6 fill-black dark:fill-white"
                      />
                    ) : (
                      <IconPlayerPause
                        stroke={2}
                        className="h-6 w-6 fill-black dark:fill-white"
                      />
                    )}
                  </Button>
                  <Button variant="ghost">
                    <IconPlayerSkipForward
                      stroke={2}
                      className="h-4 w-4 fill-black dark:fill-white"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
