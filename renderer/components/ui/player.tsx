import Image from "next/image";
import { Button } from "../ui/button";
import {
  IconArrowsShuffle2,
  IconClock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Player() {
  const [play, setPlay] = useState(false);
  const [_, setSeek] = useState(0);
  const [volume, setVolume] = useState<number[]>([0.5]);
  const [mute, setMute] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const {
    song,
    nextSong,
    previousSong,
    queue,
    history,
    currentIndex,
    repeat,
    shuffle,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  const { metadata, cover, lyrics, favourite } = useAudioMetadata(
    song?.filePath,
  );

  useEffect(() => {
    // @hiaaryan: Initialize Howl instance when a song is loaded.
    if (!song?.filePath) return;

    const sound = new Howl({
      src: ["wora://" + song?.filePath],
      format: [song?.filePath.split(".").pop()],
      html5: true,
      autoplay: true,
      volume: volume[0],
      mute: mute,
      onload: () => {
        setSeek(0);
        setPlay(true);
      },
      onloaderror: (error) => {
        resetDiscordState();
        setPlay(false);
        console.log(error);
      },
      onend: () => {
        resetDiscordState();
        setPlay(false);
        if (!repeat) {
          nextSong();
        }
      },
    });

    soundRef.current = sound;

    return () => sound.unload();
  }, [song]);

  useEffect(() => {
    if (repeat) {
      soundRef.current?.on("end", () => {
        soundRef.current?.play();
      });
    }
  }, [repeat]);

  useEffect(() => {
    // @hiaaryan: Update media session metadata and seek position, handle play/pause.
    if (!metadata) return;
    if (!soundRef.current) return;

    const updateSeek = () => {
      if (soundRef.current?.playing()) {
        setSeek(soundRef.current.seek() as number);
      }
    };

    const interval = setInterval(updateSeek, 1000);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.common.title,
        artist: metadata.common.artist,
        album: metadata.common.album,
        artwork: [{ src: cover }],
      });

      navigator.mediaSession.setActionHandler("play", handlePlayPause);
      navigator.mediaSession.setActionHandler("pause", handlePlayPause);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
      navigator.mediaSession.setActionHandler("previoustrack", previousSong);
    }

    soundRef.current.on("play", () => {
      updateDiscordState(metadata);
      setPlay(true);
    });

    soundRef.current.on("pause", () => {
      resetDiscordState();
      setPlay(false);
    });

    if (soundRef.current.state() === "loaded") {
      updateDiscordState(metadata);
    }

    return () => clearInterval(interval);
  }, [metadata]);

  useEffect(() => {
    // @hiaaryan: Update current lyric based on seek position if lyrics are available.
    if (!lyrics || !soundRef.current) return;

    const parsedLyrics = isSyncedLyrics(lyrics) ? parseLyrics(lyrics) : [];

    const updateLyrics = () => {
      if (soundRef.current?.playing()) {
        const currentSeek = soundRef.current.seek() as number;
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

  useEffect(() => {
    // @hiaaryan: Update current lyric based on seek position if lyrics are available.
    if (favourite) {
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }
  }, [metadata, favourite]);

  const withSoundRef =
    (callback: Function) =>
    (...args: any[]) => {
      // @hiaaryan: Helper function to ensure soundRef is available before executing callback.
      if (soundRef.current) {
        callback(...args);
      }
    };

  const handleVolume = (value: any) => {
    // @hiaaryan: Handle volume change.
    setVolume(value);
    if (soundRef.current) {
      soundRef.current.volume(value);
    }
  };

  const handleSeek = withSoundRef((value: any) => {
    // @hiaaryan: Handle seek position change.
    soundRef.current.seek(value);
    setSeek(value);
  });

  const handlePlayPause = withSoundRef(() => {
    // @hiaaryan: Toggle play/pause state.
    if (soundRef.current.playing()) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  });

  const toggleFavourite = (id: number) => {
    // @hiaaryan: Add song to favorites.
    if (!id) return;
    window.ipc.send("addToFavourites", id);
    setIsFavourite(!isFavourite);
  };

  const handleLyricClick = withSoundRef((time: number) => {
    // @hiaaryan: Seek to specific time on lyric click.
    soundRef.current.seek(time);
    setSeek(time);
    console.log(currentLyric);
  });

  const toggleLyrics = () => {
    // @hiaaryan: Toggle lyrics display.
    setShowLyrics(!showLyrics);
  };

  const toggleQueue = () => {
    // @hiaaryan: Toggle queue display.
    setShowQueue(!showQueue);
  };

  const toggleMute = () => {
    // @hiaaryan: Toggle mute state.
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
            <div className="justify-left h-utility flex w-full items-center text-balance rounded-xl px-8 gradient-mask-b-70-d">
              <div className="no-scrollbar gradient-mask-b-30-d h-full w-full max-w-3xl overflow-hidden overflow-y-auto text-2xl font-medium">
                <div className="flex flex-col py-[33vh]">
                  {isSyncedLyrics(lyrics) ? (
                    <Lyrics
                      lyrics={parseLyrics(lyrics)}
                      currentLyric={currentLyric}
                      onLyricClick={handleLyricClick}
                    />
                  ) : (
                    <div>
                      {lyrics.split("\n").map((line) => {
                        return <p className="my-2 py-4 opacity-40">{line}</p>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="!absolute right-0 top-0 w-96">
        {showQueue && (
          <div className="wora-border h-utility relative mt-2 h-full w-full rounded-xl bg-black/70 backdrop-blur-xl">
            <div className="h-full w-full max-w-3xl px-6 pt-6">
              <Tabs
                defaultValue="queue"
                className="flex h-full w-full flex-col gap-4 gradient-mask-b-70"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="queue" className="w-full gap-2">
                    <IconListTree stroke={2} size={15} /> Queue
                  </TabsTrigger>
                  <TabsTrigger value="history" className="w-full gap-2">
                    <IconClock stroke={2} size={15} /> History
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="queue"
                  className="no-scrollbar flex-grow overflow-y-auto pb-64"
                >
                  <ul className="flex flex-col gap-4">
                    {queue.slice(currentIndex + 1).map((song) => (
                      <li
                        key={song.id}
                        className="flex w-full items-center gap-4 overflow-hidden gradient-mask-r-70"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                          <Image
                            alt="Album Cover"
                            src={song.album.coverArt}
                            fill
                            priority={true}
                            className="object-cover"
                          />
                        </div>
                        <div className="w-4/5 overflow-hidden">
                          <p className="text-nowrap text-sm font-medium">
                            {song.name}
                          </p>
                          <p className="text-nowrap opacity-50">
                            {song.artist}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent
                  value="history"
                  className="no-scrollbar flex-grow overflow-y-auto pb-64"
                >
                  <ul className="flex flex-col gap-4">
                    {[...history].reverse().map((song) => (
                      <li
                        key={song.id}
                        className="flex w-full items-center gap-4 overflow-hidden gradient-mask-r-70"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                          <Image
                            alt="Album Cover"
                            src={song.album.coverArt}
                            fill
                            priority={true}
                            className="object-cover"
                          />
                        </div>
                        <div className="w-4/5 overflow-hidden">
                          <p className="text-nowrap text-sm font-medium">
                            {song.name}
                          </p>
                          <p className="text-nowrap opacity-50">
                            {song.artist}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
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
                  alt="Album Cover"
                  src={cover}
                  fill
                  priority={true}
                  className="object-cover"
                />
              </div>
              <div className="w-1/3 gradient-mask-r-70">
                <p className="text-nowrap text-sm font-medium">
                  {metadata ? metadata.common.title : "Echoes of Emptiness"}
                </p>
                <p className="text-nowrap opacity-50">
                  {metadata ? metadata.common.artist : "The Void Ensemble"}
                </p>
              </div>
            </div>
            <div className="absolute left-0 right-0 mx-auto flex h-full w-1/3 flex-col items-center justify-between">
              <div className="relative flex items-center gap-8">
                <Button
                  variant="ghost"
                  asChild
                  className="relative !opacity-100"
                >
                  <Button
                    variant="ghost"
                    className="relative !opacity-100"
                    onClick={() => toggleShuffle()}
                    asChild
                  >
                    {!shuffle ? (
                      <IconArrowsShuffle2
                        stroke={2}
                        size={16}
                        className="!opacity-30 hover:!opacity-100"
                      />
                    ) : (
                      <div>
                        <IconArrowsShuffle2 stroke={2} size={16} />
                        <div className="absolute -top-2 left-0 right-0 mx-auto h-[1.5px] w-2/3 rounded-full bg-white"></div>
                      </div>
                    )}
                  </Button>
                </Button>
                <Button variant="ghost" onClick={previousSong}>
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
                <Button variant="ghost" onClick={nextSong}>
                  <IconPlayerSkipForward
                    stroke={2}
                    className="h-4 w-4 fill-white"
                  />
                </Button>
                <Button
                  variant="ghost"
                  className="relative !opacity-100"
                  onClick={() => toggleRepeat()}
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
                {metadata && metadata.format.lossless && (
                  <div className="absolute -left-24 mt-0.5">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <IconWaveSine stroke={2} className="w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={25}>
                        <p>
                          Lossless [{metadata.format.bitsPerSample}/
                          {(metadata.format.sampleRate / 1000).toFixed(1)}kHz]
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                <div className="absolute -right-24 mt-0.5">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        className="!opacity-100"
                        onClick={() => {
                          toggleFavourite(song?.id);
                        }}
                        asChild
                      >
                        <IconHeart
                          stroke={2}
                          className={
                            `${isFavourite ? "fill-red-500" : "fill-none"}` +
                            " w-3.5 text-red-500"
                          }
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={25}>
                      <p className="delay-500">
                        {!isFavourite
                          ? "Add to Favourites"
                          : "Remove from Favourites"}
                      </p>
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
                  <DialogContent>
                    <div className="flex h-full w-full items-start gap-6 overflow-hidden gradient-mask-r-70">
                      <div className="jusitfy-between flex h-full w-full flex-col gap-4">
                        <DialogHeader>
                          <DialogTitle>Track Information</DialogTitle>
                          <DialogDescription>
                            All the deets for your currently playing song.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-4 overflow-hidden text-xs">
                          <div className="h-full">
                            <div className="relative h-36 w-36 overflow-hidden rounded-lg">
                              <Image
                                alt="album"
                                src={cover}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex h-full w-full flex-col gap-0.5">
                            <p className="mb-4 text-nowrap">
                              → {metadata && metadata.common.title} [
                              {metadata && metadata.format.codec}]
                            </p>
                            <p className="text-nowrap">
                              <span className="opacity-50">Artist:</span>{" "}
                              {metadata && metadata.common.artist}
                            </p>
                            <p className="text-nowrap">
                              <span className="opacity-50">Album:</span>{" "}
                              {metadata && metadata.common.album}
                            </p>
                            <p className="text-nowrap">
                              <span className="opacity-50">Codec:</span>{" "}
                              {metadata && metadata.format.codec}
                            </p>
                            {metadata && metadata.format.lossless ? (
                              <p className="text-nowrap">
                                <span className="opacity-50">Sample:</span>{" "}
                                Lossless [
                                {metadata && metadata.format.bitsPerSample}/
                                {metadata &&
                                  (metadata.format.sampleRate / 1000).toFixed(
                                    1,
                                  )}
                                kHz]
                              </p>
                            ) : (
                              <p className="text-nowrap">
                                <span className="opacity-50">Sample:</span>{" "}
                                Lossy Audio
                              </p>
                            )}
                            <p className="text-nowrap">
                              <span className="opacity-50">Duration:</span>{" "}
                              {convertTime(soundRef.current?.duration())}
                            </p>
                            <p className="text-nowrap">
                              <span className="opacity-50">Genre:</span>{" "}
                              {(metadata && metadata.common.genre) || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" onClick={toggleQueue}>
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
