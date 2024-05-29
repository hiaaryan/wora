import Image from "next/image";
import { Button } from "../ui/button";
import {
  IconArrowsShuffle2,
  IconHeart,
  IconInfoCircle,
  IconListTree,
  IconMicrophone2,
  IconMicrophone2Off,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconRepeat,
  IconVolume,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import * as mm from "music-metadata-browser";
import { IAudioMetadata } from "music-metadata-browser";
import { Slider } from "../ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
interface LyricLine {
  time: number;
  text: string;
}
import { handleLyrics } from "./playerHandlers/handleLyrics";
import Lyrics from "../ui/lyrics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function Player() {
  const [play, setPlay] = useState(false);
  const [seek, setSeek] = useState("0:00");
  const [seekSeconds, setSeekSeconds] = useState([0]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(0.5);
  const [data, setData] = useState<IAudioMetadata | null>(null);
  const [cover, setCover] = useState("https://iili.io/HlHy9Yx.png");
  const soundRef = useRef<Howl | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);

  let metadata: any;

  const fetchMetadata = async () => {
    try {
      metadata = await mm.fetchFromUrl("/test.flac", {
        skipPostHeaders: true,
      });

      setData(metadata);

      const coverArt = mm.selectCover(metadata.common.picture);
      if (coverArt) {
        const art = `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`;
        setCover(art);
      }

      setLyrics(
        await handleLyrics(
          metadata.common.title + " " + metadata.common.artist,
          metadata.format.duration,
        ),
      );
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const convertTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Pad seconds with leading zero if less than 10
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${minutes}:${formattedSeconds}`;
  };

  const parseLyrics = (lyrics: string): LyricLine[] => {
    return lyrics
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\] (.*)$/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          const time = minutes * 60 + seconds;
          const text = match[3];
          return { time, text };
        }
        return null;
      })
      .filter((line) => line !== null) as LyricLine[];
  };

  const isSyncedLyrics = (lyrics: string): boolean => {
    return /\[\d{2}:\d{2}\.\d{2}\]/.test(lyrics);
  };

  let parsedLyrics: LyricLine[] = [];

  if (lyrics && isSyncedLyrics(lyrics)) {
    parsedLyrics = parseLyrics(lyrics);
  }

  useEffect(() => {
    fetchMetadata();

    window.ipc.send("set-rpc-state", {
      details: "Taking a Break...",
      state: "Browsing FLACs 🎧",
    });

    var sound = new Howl({
      src: ["/test.flac"],
      html5: true,
      format: ["flac"],
    });

    soundRef.current = sound;

    const interval = setInterval(() => {
      if (sound.playing()) {
        setSeekSeconds([sound.seek()]);
        setDurationSeconds(sound.duration());
        setSeek(convertTime(Math.round(sound.seek())));
        setDuration(convertTime(Math.round(sound.duration())));

        if (metadata) {
          window.ipc.send("set-rpc-state", {
            details: `${metadata.common.title} (${metadata.common.artist})`,
            state: `[${metadata.format.bitsPerSample}/${(metadata.format.sampleRate / 1000).toFixed(1)}kHz] ${convertTime(Math.round(sound.seek()))} / ${convertTime(Math.round(sound.duration()))}`,
          });
        }

        if (parsedLyrics.length > 0) {
          const parsedLyrics = parseLyrics(lyrics);
          const currentLyricLine = parsedLyrics.find((line, index) => {
            const nextLine = parsedLyrics[index + 1];
            return (
              sound.seek() >= line.time &&
              (!nextLine || sound.seek() < nextLine.time)
            );
          });
          setCurrentLyric(currentLyricLine || null);
        }
      }
    }, 1000);

    sound.on("end", function () {
      setSeekSeconds([0]);
      setSeek("0:00");
      setDuration("0:00");
      setPlay(false);
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
    });

    return () => clearInterval(interval);
  }, [lyrics, metadata]);

  const handleVolume = (value: any) => {
    setVolume(value);
    Howler.volume(value);
  };

  const handleSeek = (value: any) => {
    soundRef.current.seek(value);
    setSeekSeconds(value);
  };

  const handlePlayPause = () => {
    if (soundRef.current.playing()) {
      soundRef.current.pause();
      setPlay(false);
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
    } else {
      soundRef.current.play();
      setPlay(true);
      if (data) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: data.common.title,
          artist: data.common.artist,
          artwork: [{ src: cover }],
        });
      }
    }
  };

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  return (
    <div>
      <div className="!absolute top-0 left-0 w-full">
        {showLyrics && lyrics && (
          <div className="w-full h-full bg-white dark:bg-black wora-border rounded-xl">
            <div className="text-balance gradient-mask-b-50-d rounded-xl bg-white dark:bg-black dark:text-white h-[77vh] w-full flex items-center justify-left px-8">
              {isSyncedLyrics(lyrics) ? (
                <Lyrics
                  lyrics={parseLyrics(lyrics)}
                  currentLyric={currentLyric}
                />
              ) : (
                <div className="overflow-hidden no-scrollbar overflow-y-auto py-80 h-full w-full text-3xl font-semibold gradient-mask-b-40-d">
                  <div className="max-w-3xl flex flex-col gap-6">
                    {lyrics.split("\n").map((line) => {
                      return (
                        <p className="text-black dark:text-white opacity-75 font-semibold">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="z-50 w-full h-24 bg-white dark:bg-black wora-border rounded-xl p-4">
        <TooltipProvider>
          <div className="relative w-full justify-between flex h-full items-center">
            <div className="absolute w-1/2 left-0 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden transition duration-500">
                <Image alt="album" src={cover} fill className="object-cover" />
              </div>
              <div className="gradient-mask-r-70 w-1/3">
                <p className="text-nowrap text-sm">
                  {data ? data.common.title : "Echoes of Emptiness"}
                </p>
                <p className="text-nowrap opacity-50">
                  {data ? data.common.artist : "The Void Ensemble"}
                </p>
              </div>
            </div>
            <div className="absolute left-0 mx-auto right-0 flex flex-col justify-around h-full w-1/3 items-center ">
              <div className="relative flex items-center gap-8">
                <Button variant="ghost">
                  <IconArrowsShuffle2 stroke={2} size={15} />
                </Button>
                <Button variant="ghost">
                  <IconPlayerSkipBack
                    stroke={2}
                    className="fill-black dark:fill-white"
                    size={15}
                  />
                </Button>
                <Button variant="ghost" onClick={handlePlayPause}>
                  {!play ? (
                    <IconPlayerPlay
                      stroke={2}
                      className="w-6 h-6 fill-black dark:fill-white"
                    />
                  ) : (
                    <IconPlayerPause
                      stroke={2}
                      className="w-6 h-6 fill-black dark:fill-white"
                    />
                  )}
                </Button>
                <Button variant="ghost">
                  <IconPlayerSkipForward
                    stroke={2}
                    className="w-4 fill-black dark:fill-white h-4"
                  />
                </Button>
                <Button variant="ghost">
                  <IconRepeat stroke={2} size={15} />
                </Button>
                {data && data.format.lossless && (
                  <div className="absolute -left-16 -mb-0.5">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <Image
                          alt="lossless"
                          src="/icon[dark].ico"
                          width={12}
                          height={12}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={25}>
                        <p>
                          Lossless [{data.format.bitsPerSample}/
                          {(data.format.sampleRate / 1000).toFixed(1)}kHz]
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                <div className="absolute -right-16 -mb-0.5">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <IconHeart stroke={2} className="w-3.5 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={25}>
                      <p>Like Song</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="relative w-full gap-3 flex items-center">
                <p className="absolute -left-10">{seek}</p>
                <Slider
                  defaultValue={[0]}
                  value={seekSeconds}
                  onValueChange={handleSeek}
                  max={durationSeconds}
                  step={0.01}
                />
                <p className="absolute -right-10">{duration}</p>
              </div>
            </div>
            <div className="absolute w-1/3 right-0 flex items-center justify-end gap-8">
              <div className="w-1/4 flex items-center gap-2 group/volume">
                <IconVolume stroke={2} size={20} className="opacity-40" />
                <Slider
                  onValueChange={handleVolume}
                  defaultValue={[volume]}
                  max={1}
                  step={0.01}
                />
              </div>
              <div className="flex items-center gap-4">
                {lyrics ? (
                  <Button variant="ghost" onClick={toggleLyrics}>
                    <IconMicrophone2 stroke={2} size={15} />
                  </Button>
                ) : (
                  <Button variant="ghost" className="text-red-500 !opacity-100">
                    <IconMicrophone2Off stroke={2} size={15} />
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger className="opacity-40 hover:opacity-100 duration-500">
                    <IconInfoCircle stroke={2} size={15} />
                  </DialogTrigger>
                  <DialogContent className="flex items-start gap-8">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden transition duration-500">
                      <Image
                        alt="album"
                        src={cover}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <DialogHeader>
                      <DialogTitle>Track Information</DialogTitle>
                      <DialogDescription>
                        {data && data.common.title}{" "}
                        {data && data.format.sampleRate}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost">
                  <IconListTree stroke={2} size={15} />
                </Button>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default Player;
