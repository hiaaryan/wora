import Image from "next/image";
import { Button } from "../ui/button";
import {
  IconArrowsShuffle2,
  IconHeart,
  IconInfoCircle,
  IconListTree,
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

function Player() {
  const [play, setPlay] = useState(false);
  const [seek, setSeek] = useState("0:00");
  const [seekSeconds, setSeekSeconds] = useState([0]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(0.5);
  const [data, setData] = useState<IAudioMetadata | null>(null);
  const [cover, setCover] = useState("https://iili.io/HlHy9Yx.png");
  const soundRef = useRef(null);

  useEffect(() => {
    window.ipc.send("set-rpc-state", {
      details: "Taking a Break...",
      state: "Browsing FLACs 🎧",
    });

    var sound = new Howl({
      src: ["/test.flac"],
      html5: true,
      format: ["flac"],
      volume: volume,
    });

    soundRef.current = sound;

    let metadata: any;

    const fetchMetadata = async () => {
      metadata = await mm.fetchFromUrl("/test.flac", {});
      console.log(metadata);
    };

    fetchMetadata().then(() => {
      var dataInit = metadata;
      const getCover = mm.selectCover(metadata.common.picture);
      if (getCover != null) {
        const art = `data:${getCover.format};base64,${getCover.data.toString("base64")}`;
        setCover(art);
      }
      setData(dataInit);
    });

    const convertTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      // Pad seconds with leading zero if less than 10
      const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
      return `${minutes}:${formattedSeconds}`;
    };

    const interval = setInterval(() => {
      if (sound.playing()) {
        setSeekSeconds([sound.seek()]);
        setDurationSeconds(sound.duration());
        setSeek(convertTime(Math.round(sound.seek())));
        setDuration(convertTime(Math.round(sound.duration())));
        window.ipc.send("set-rpc-state", {
          details: metadata.common.title + " (" + metadata.common.artist + ")",
          state:
            " [" +
            metadata.format.bitsPerSample +
            "/" +
            (metadata.format.sampleRate / 1000).toFixed(1) +
            "kHz] " +
            convertTime(Math.round(sound.seek())) +
            " / " +
            convertTime(Math.round(sound.duration())),
        });
      }
    }, 1000);

    sound.on("end", function () {
      setPlay(false);
      setSeekSeconds([0]);
      setSeek("0:00");
      setDuration("0:00");
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
    });

    return () => clearInterval(interval);
  }, []);

  const handleVolume = (value: any) => {
    setVolume(value);
    Howler.volume(value);
  };

  const handleSeek = (value: any) => {
    soundRef.current.seek(value);
    setSeekSeconds(value);
  };

  const handlePlayPause = () => {
    if (play) {
      soundRef.current.pause();
      setPlay(false);
      window.ipc.send("set-rpc-state", {
        details: "Taking a Break...",
        state: "Browsing FLACs 🎧",
      });
    } else {
      soundRef.current.play();
      setPlay(true);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.common.title,
        artist: data.common.artist,
        album: data.common.album,
        artwork: [{ src: cover }],
      });
    }
  };

  return (
    <div className="z-50 w-full h-24 bg-white dark:bg-black wora-border rounded-xl p-4">
      <div className="relative w-full justify-between flex h-full items-center">
        <div className="absolute w-1/2 left-0 flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden transition duration-500">
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
          <div className="flex items-center gap-8">
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
            <Button variant="ghost" className="!opacity-100">
              <IconHeart stroke={2} size={15} className="stroke-red-500" />
            </Button>
            <Dialog>
              <DialogTrigger className="opacity-40 hover:opacity-100 duration-500">
                <IconInfoCircle stroke={2} size={15} />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Track Information</DialogTitle>
                  <DialogDescription>
                    {data && data.common.title} {data && data.format.sampleRate}
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
    </div>
  );
}

export default Player;
