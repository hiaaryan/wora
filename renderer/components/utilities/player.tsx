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
  IconVolumeOff,
  IconWaveSine,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
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
import {
  convertTime,
  isSyncedLyrics,
  parseLyrics,
} from "./helpers/utilFunctions";
import useAudioMetadata from "./helpers/useAudioMetadata";
import updateDiscordState, { resetDiscordState } from "./helpers/setDiscordRPC";
interface PlayerCommand {
  type: "play" | "seek";
  seek?: number;
}

function Player() {
  const [play, setPlay] = useState(false);
  const [seek, setSeek] = useState("0:00");
  const [seekSeconds, setSeekSeconds] = useState([0]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState<number[]>([0.5]);
  const [mute, setMute] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [file, setFile] = useState("/url");

  const { data, cover, lyrics } = useAudioMetadata(file);
  let parsedLyrics: LyricLine[] = [];

  if (lyrics && isSyncedLyrics(lyrics)) {
    parsedLyrics = parseLyrics(lyrics);
  }

  useEffect(() => {
    if (!file) return;

    const sound = new Howl({
      src: ["music://" + file],
      format: ["flac"],
      loop: repeat,
    });

    soundRef.current = sound;

    const updateInterval = setInterval(() => {
      if (sound.playing()) {
        const currentSeek = sound.seek() as number;
        setSeekSeconds([currentSeek]);
        setDurationSeconds(sound.duration());
        setSeek(convertTime(Math.round(currentSeek)));
        setDuration(convertTime(Math.round(sound.duration())));

        if (data) {
          updateDiscordState(data, currentSeek, true);
        }

        window.ipc.send("player-update", {
          play: true,
          seek: currentSeek,
          duration: sound.duration(),
          metadata: data,
          cover: cover,
        });

        if (parsedLyrics.length > 0) {
          const currentLyricLine = parsedLyrics.find((line, index) => {
            const nextLine = parsedLyrics[index + 1];
            return (
              currentSeek >= line.time &&
              (!nextLine || currentSeek < nextLine.time)
            );
          });

          setCurrentLyric(currentLyricLine || null);
        }
      }
    }, 1000);

    sound.on("end", () => {
      setSeekSeconds([0]);
      setSeek("0:00");
      setPlay(false);
      setDuration("0:00");
      resetDiscordState();
    });

    sound.on("pause", () => {
      resetDiscordState();
      setPlay(false);
    });

    sound.on("play", () => {
      setPlay(true);
    });

    return () => {
      clearInterval(updateInterval);
      resetDiscordState();
      sound.unload();
    };
  }, [file, data, lyrics]);

  useEffect(() => {
    window.ipc.on("player-command", (command: PlayerCommand) => {
      switch (command.type) {
        case "play":
          handlePlayPause();
          break;
        case "seek":
          handleSeek(command.seek);
          break;
        default:
          break;
      }
    });
  }, []);

  const handleVolume = (value: any) => {
    setVolume(value);
    soundRef.current.volume(value);
  };

  const handleSeek = (value: any) => {
    soundRef.current.seek(value);
    setSeekSeconds(value);
    setSeek(convertTime(Math.round(value)));
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
    setSeek(convertTime(Math.round(time)));
    setDuration(convertTime(Math.round(soundRef.current.duration())));
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
            <div className="justify-left h-lyrics flex w-full items-center text-balance rounded-xl bg-white px-8 gradient-mask-b-60-d dark:bg-black dark:text-white">
              <div className="no-scrollbar gradient-mask-b-40-d h-full w-full overflow-hidden overflow-y-auto text-3xl font-medium">
                <div className="my-72 flex max-w-3xl flex-col">
                  {isSyncedLyrics(lyrics) ? (
                    <Lyrics
                      lyrics={parseLyrics(lyrics)}
                      currentLyric={currentLyric}
                      onLyricClick={handleLyricClick}
                    />
                  ) : (
                    <div>
                      {lyrics.split("\n").map((line) => {
                        return (
                          <p className="my-10 font-semibold text-black opacity-75 dark:text-white">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
                      <IconRepeat stroke={2} size={15} />
                      <div className="absolute -top-2 left-0 right-0 mx-auto h-px w-2/3 rounded-full bg-black dark:bg-white"></div>
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
                      className="wora-transition !opacity-40 hover:!opacity-100"
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
                  defaultValue={volume}
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
