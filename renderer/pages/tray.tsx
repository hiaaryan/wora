import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Slider } from "@/components/ui/slider";
import { IAudioMetadata } from "music-metadata-browser";
import Image from "next/image";
interface trayData {
  play: boolean;
  seek: number;
  duration: number;
  metadata: IAudioMetadata;
  cover: string;
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
    window.ipc.send("tray-command", "play_pause");
  };

  useEffect(() => {
    window.ipc.on("tray-update", (data: trayData) => {
      setTrayData(data);
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Tray</title>
      </Head>
      <div className="wora-bg h-screen w-screen overflow-hidden p-6 text-xs text-black antialiased dark:text-white">
        <div className="flex h-full w-full items-center">
          <div className="flex h-full w-full flex-col items-center justify-between gap-4">
            <div className="flex w-full items-center gap-6">
              <div className="w-fit">
                <div className="relative h-16 w-16 overflow-hidden rounded-md transition duration-500">
                  {trayData && trayData.cover && (
                    <Image
                      alt="album"
                      src={trayData.cover}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="flex h-full w-2/3 flex-col items-start justify-around">
                <div className="w-full gradient-mask-r-70">
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
                  // onValueChange={handleSeek}
                  max={trayData && trayData.duration}
                  step={0.01}
                />
              </div>
            </div>
            <div className="relative flex w-full items-center justify-center gap-3"></div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
