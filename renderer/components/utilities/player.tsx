import Image from "next/image";
import { Button } from "../ui/button";
import {
  IconArrowsShuffle2,
  IconHeart,
  IconInfoCircle,
  IconLine,
  IconLineDashed,
  IconListTree,
  IconMicrophone2,
  IconMicrophone2Off,
  IconOverline,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconPoint,
  IconRepeat,
  IconVolume,
  IconVolumeOff,
  IconWaveSine,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
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
import Lyrics from "../ui/lyrics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { fetchMetadata } from "./helpers/fetchMetadata";
import { fetchLyrics } from "./helpers/fetchLyrics";
import {
  convertTime,
  isSyncedLyrics,
  parseLyrics,
} from "./helpers/playerFunctions";

function Player() {
  const [play, setPlay] = useState(false);
  const [seek, setSeek] = useState("0:00");
  const [seekSeconds, setSeekSeconds] = useState([0]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(0.5);
  const [mute, setMute] = useState(false);
  const [data, setData] = useState<IAudioMetadata | null>(null);
  const [cover, setCover] = useState("https://iili.io/HlHy9Yx.png");
  const soundRef = useRef<Howl | null>(null);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(false);

  const [file, setFile] = useState(
    "/Users/hiaaryan/Documents/FLACs/Bachna Ae Haseeno/05 Small Town Girl.flac",
  );

  let metadata: any;
  let parsedLyrics: LyricLine[] = [];

  if (lyrics && isSyncedLyrics(lyrics)) {
    parsedLyrics = parseLyrics(lyrics);
  }

  useEffect(() => {
    fetchMetadata(file)
      .then(async (response) => {
        metadata = response.metadata;
        setData(response.metadata);
        setCover(response.art);
        setLyrics(
          await fetchLyrics(
            `${metadata.common.title} ${metadata.common.artist}`,
            metadata.format.duration,
          ),
        );
      })
      .catch((error) => {
        console.log("Failed to fetch metdata: ", error.message);
      });

    var sound = new Howl({
      src: ["music://" + file],
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
          const state = metadata.format.lossless
            ? `[${metadata.format.bitsPerSample}/${(
                metadata.format.sampleRate / 1000
              ).toFixed(
                1,
              )}kHz] ${convertTime(Math.round(sound.seek()))} / ${convertTime(
                Math.round(sound.duration()),
              )}`
            : `[${metadata.format.container}] ${convertTime(
                Math.round(sound.seek()),
              )} / ${convertTime(Math.round(sound.duration()))}`;

          window.ipc.send("set-rpc-state", {
            details: `${metadata.common.title} (${metadata.common.artist})`,
            state,
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

  const handleRepeat = () => {
    soundRef.current.loop(!repeat);
    setRepeat(!repeat);
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
    setMute(!mute);
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
                <div className="no-scrollbar gradient-mask-b-40-d h-full w-full overflow-hidden overflow-y-auto py-80 text-3xl font-medium">
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
                  <IconArrowsShuffle2 stroke={2} size={16} />
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
                <Button
                  variant="ghost"
                  className="relative !opacity-100"
                  onClick={handleRepeat}
                  asChild
                >
                  {!repeat ? (
                    <IconRepeat
                      stroke={2}
                      size={15}
                      className="!opacity-40 hover:!opacity-100"
                    />
                  ) : (
                    <div>
                      <IconRepeat stroke={2} size={15} />{" "}
                      <div className="absolute -top-2 left-0 right-0 mx-auto h-px w-2/3 bg-black dark:bg-white"></div>
                    </div>
                  )}
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
                <Button
                  variant="ghost"
                  onClick={toggleMute}
                  className="!opacity-100"
                >
                  {!mute ? (
                    <IconVolume
                      stroke={2}
                      size={17.5}
                      className="wora-transition !opacity-30 hover:!opacity-100"
                    />
                  ) : (
                    <IconVolumeOff
                      stroke={2}
                      size={17.5}
                      className="text-red-500"
                    />
                  )}
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
                  <Button variant="ghost" className="text-red-500 opacity-100">
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
