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
import { convertTime, isSyncedLyrics, parseLyrics } from "@/lib/helpers";
import { useAudioMetadata } from "@/lib/helpers";
import { Badge } from "../ui/badge";
import { updateDiscordState, resetDiscordState } from "@/lib/helpers";
import { usePlayer } from "@/context/playerContext";

function Player() {
  const [play, setPlay] = useState(false);
  const [_, setSeek] = useState(0);
  const [volume, setVolume] = useState<number[]>([0.5]);
  const [mute, setMute] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [repeat, setRepeat] = useState<boolean>(false);
  const { file } = usePlayer();
  const { data, cover, lyrics } = useAudioMetadata(file);

  useEffect(() => {
    if (!file) return;

    const sound = new Howl({
      src: ["music://" + file],
      format: [file.split(".").pop()],
      loop: repeat,
      html5: true,
      autoplay: true,
      volume: volume[0],
      mute: mute,
      onload: () => {
        setSeek(0);
      },
      onloaderror: (id, error) => {
        console.error(error, id);
      },
    });

    soundRef.current = sound;

    return () => sound.unload();
  }, [file]);

  useEffect(() => {
    resetDiscordState();

    if (!data) return;

    const updateSeek = () => {
      if (soundRef.current.playing()) {
        setSeek(soundRef.current.seek());
      }
    };

    const interval = setInterval(updateSeek, 1000);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.common.title,
        artist: data.common.artist,
        album: data.common.album,
        artwork: [{ src: cover }],
      });

      navigator.mediaSession.setActionHandler("play", handlePlayPause);
      navigator.mediaSession.setActionHandler("pause", handlePlayPause);
    }

    soundRef.current.on("end", () => {
      setPlay(false);
      resetDiscordState();
    });

    soundRef.current.on("pause", () => {
      setPlay(false);
      resetDiscordState();
    });

    soundRef.current.on("play", () => {
      setPlay(true);
      updateDiscordState(data);
    });

    return () => clearInterval(interval);
  }, [data]);

  useEffect(() => {
    if (!lyrics || !soundRef.current) return;

    const parsedLyrics = isSyncedLyrics(lyrics) ? parseLyrics(lyrics) : [];

    const updateLyrics = () => {
      if (soundRef.current.playing()) {
        const currentSeek = soundRef.current.seek();
        const currentLyricLine = parsedLyrics.find((line, index) => {
          const nextLine = parsedLyrics[index + 1];
          return (
            currentSeek >= line.time &&
            (!nextLine || currentSeek < nextLine.time)
          );
        });

        setCurrentLyric(currentLyricLine || null);
      }
    };

    const interval = setInterval(updateLyrics, 1000);

    return () => clearInterval(interval);
  }, [lyrics]);

  const withSoundRef =
    (callback: Function) =>
    (...args: any[]) => {
      if (soundRef.current) {
        callback(...args);
      }
    };

  const handleVolume = (value: any) => {
    setVolume(value);
    if (soundRef.current) {
      soundRef.current.volume(value);
    }
  };

  const handleSeek = withSoundRef((value: any) => {
    soundRef.current.seek(value);
    setSeek(value);
  });

  const handleRepeat = withSoundRef(() => {
    soundRef.current.loop(!repeat);
    setRepeat(!repeat);
  });

  const handlePlayPause = withSoundRef(() => {
    if (soundRef.current.playing()) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  });

  const handleLyricClick = withSoundRef((time: number) => {
    soundRef.current.seek(time);
    setSeek(time);
  });

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const toggleMute = () => {
    setMute(!mute);
    if (soundRef.current) {
      soundRef.current.mute(!soundRef.current.mute());
    }
  };

  return (
    <div>
      <div className="!absolute left-0 top-0 w-full">
        {showLyrics && lyrics && (
          <div className="wora-border relative mt-2 h-full w-full rounded-xl bg-black/70 backdrop-blur-xl">
            <div className="absolute bottom-5 right-6 z-50 flex items-center gap-2">
              {isSyncedLyrics(lyrics) ? (
                <Badge>Synced</Badge>
              ) : (
                <Badge>Unsynced</Badge>
              )}
            </div>
            <div className="justify-left h-lyrics flex w-full items-center text-balance rounded-xl px-8 gradient-mask-b-70-d">
              <div className="no-scrollbar gradient-mask-b-30-d h-full w-full overflow-hidden overflow-y-auto text-2xl font-medium">
                <div className="flex max-w-3xl flex-col py-[33vh]">
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
                          <p className="my-2 py-4 font-semibold opacity-40">
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
      <div className="wora-border z-50 h-[6.5rem] w-full rounded-xl bg-black/70 p-6 backdrop-blur-xl">
        <TooltipProvider>
          <div className="relative flex h-full w-full items-center justify-between">
            <div className="absolute left-0 flex w-1/2 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md transition duration-500">
                <Image
                  alt="album"
                  src={cover}
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="w-1/3 gradient-mask-r-70">
                <p className="text-nowrap text-sm font-medium">
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
                    className="fill-white"
                    size={15}
                  />
                </Button>
                <Button variant="ghost" onClick={handlePlayPause}>
                  {!play ? (
                    <IconPlayerPlay stroke={2} className="h-6 w-6 fill-white" />
                  ) : (
                    <IconPlayerPause
                      stroke={2}
                      className="h-6 w-6 fill-white"
                    />
                  )}
                </Button>
                <Button variant="ghost">
                  <IconPlayerSkipForward
                    stroke={2}
                    className="h-4 w-4 fill-white"
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
                      className="!opacity-30 hover:!opacity-100"
                    />
                  ) : (
                    <div>
                      <IconRepeat stroke={2} size={15} />
                      <div className="absolute -top-2 left-0 right-0 mx-auto h-[1.5px] w-2/3 rounded-full bg-white"></div>
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
                <p className="absolute -left-10">
                  {convertTime(soundRef.current?.seek() || 0)}
                </p>
                <Slider
                  defaultValue={[0]}
                  value={[soundRef.current?.seek() || 0]}
                  onValueChange={handleSeek}
                  max={soundRef.current?.duration() || 0}
                  step={0.01}
                />
                <p className="absolute -right-10">
                  {convertTime(soundRef.current?.duration() || 0)}
                </p>
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
                  <DialogTrigger className="opacity-30 duration-500 hover:opacity-100">
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
