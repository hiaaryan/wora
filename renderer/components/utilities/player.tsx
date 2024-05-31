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
  IconWaveSine,
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
  const [file, setFile] = useState(
    "/Users/hiaaryan/Soulseek Downloads/complete/raspberry/TECHNO_/0600 - Modjo - Lady (Hear Me Tonight).flac",
  );

  let metadata: any;

  const fetchMetadata = async () => {
    try {
      metadata = await mm.fetchFromUrl("music://" + file, {
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
          let text = match[3].trim();
          if (text === "") {
            text = "...";
          }
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
      src: ["music://" + file],
      html5: false,
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
          if (metadata.format.lossless) {
            window.ipc.send("set-rpc-state", {
              details: `${metadata.common.title} (${metadata.common.artist})`,
              state: `[${metadata.format.bitsPerSample}/${(metadata.format.sampleRate / 1000).toFixed(1)}kHz] ${convertTime(Math.round(sound.seek()))} / ${convertTime(Math.round(sound.duration()))}`,
            });
          } else {
            window.ipc.send("set-rpc-state", {
              details: `${metadata.common.title} (${metadata.common.artist})`,
              state: `[${metadata.format.container}] ${convertTime(Math.round(sound.seek()))} / ${convertTime(Math.round(sound.duration()))}`,
            });
          }
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
      setPlay(false);
      setDuration("0:00");
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
    });

    sound.on("pause", function () {
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
      setPlay(false);
    });

    sound.on("play", function () {
      setPlay(true);

      if (metadata) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: metadata.common.title,
          artist: metadata.common.artist,
          artwork: [{ src: cover }],
        });
      }
    });

    return () => clearInterval(interval);
  }, [lyrics, metadata, file]);

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
    } else {
      soundRef.current.play();
    }
  };

  const handleLyricClick = (time: number) => {
    soundRef.current.seek(time);
    setSeekSeconds([time]);
  };

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const toggleMute = () => {
    soundRef.current.mute(!soundRef.current.mute());
  };

  return (
    <div>
      <div className="!absolute left-0 top-0 w-full">
        {showLyrics && lyrics && (
          <div className="wora-border h-full w-full rounded-xl bg-white dark:bg-black">
            <div className="justify-left h-lyrics flex w-full items-center text-balance rounded-xl bg-white px-8 gradient-mask-b-50-d dark:bg-black dark:text-white">
              {isSyncedLyrics(lyrics) ? (
                <Lyrics
                  lyrics={parseLyrics(lyrics)}
                  currentLyric={currentLyric}
                  onLyricClick={handleLyricClick}
                />
              ) : (
                <div className="no-scrollbar gradient-mask-b-40-d h-full w-full overflow-hidden overflow-y-auto py-80 text-3xl font-semibold">
                  <div className="flex max-w-3xl flex-col gap-6">
                    {lyrics.split("\n").map((line) => {
                      return (
                        <p className="font-semibold text-black opacity-75 dark:text-white">
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
      <div className="wora-border z-50 h-[6.5rem] w-full rounded-xl bg-white p-6 dark:bg-black">
        <TooltipProvider>
          <div className="relative flex h-full w-full items-center justify-between">
            <div className="absolute left-0 flex w-1/2 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md transition duration-500">
                <Image alt="album" src={cover} fill className="object-cover" />
              </div>
              <div className="w-1/3 gradient-mask-r-70">
                <p className="text-nowrap text-sm">
                  {data ? data.common.title : "Echoes of Emptiness"}
                </p>
                <p className="text-nowrap opacity-50">
                  {data ? data.common.artist : "The Void Ensemble"}
                </p>
              </div>
            </div>
            <div className="absolute left-0 right-0 mx-auto flex h-full w-1/3 flex-col items-center justify-between">
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
                <Button variant="ghost">
                  <IconRepeat stroke={2} size={14} />
                </Button>
                {data && data.format.lossless && (
                  <div className="absolute -left-24 mt-0.5">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <IconWaveSine stroke={2} className="w-3.5" />
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
                <div className="absolute -right-24 mt-0.5">
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
              <div className="relative flex w-full items-center gap-3">
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
            <div className="absolute right-0 flex w-1/3 items-center justify-end gap-8">
              <div className="group/volume flex w-1/4 items-center gap-3">
                <Button variant="ghost" onClick={toggleMute}>
                  <IconVolume stroke={2} size={17.5} />
                </Button>
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
                  <Button variant="ghost" className="text-red-500 !opacity-60">
                    <IconMicrophone2Off stroke={2} size={15} />
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger className="opacity-40 duration-500 hover:opacity-100">
                    <IconInfoCircle stroke={2} size={15} />
                  </DialogTrigger>
                  <DialogContent className="flex items-start gap-8">
                    <div className="relative h-28 w-28 overflow-hidden rounded-lg transition duration-500">
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
