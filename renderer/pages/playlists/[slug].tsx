import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { convertTime } from "@/lib/helpers";
import {
  IconCircleFilled,
  IconClock,
  IconPlayerPlay,
  IconArrowsShuffle2,
  IconArrowLeft,
} from "@tabler/icons-react";
import { usePlayer } from "@/context/playerContext";

type Song = {
  id: number;
  filePath: string;
  name: string;
  artist: string;
  duration: number;
  album: {
    name: string;
    coverArt: string;
  };
};

type Playlist = {
  name: string;
  description: string;
  coverArt: string;
  songs: Song[];
};

export default function Playlist() {
  const router = useRouter();
  const [playlist, setAlbum] = useState<Playlist | null>(null);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    window.ipc
      .invoke("getPlaylistWithSongs", router.query.slug)
      .then((response) => {
        setAlbum(response);
      });
  }, [router.query.slug]);

  const handleMusicClick = (index: number) => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, index);
    }
  };

  const playPlaylist = () => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, 0);
    }
  };

  const playPlaylistAndShuffle = () => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, 0, true);
    }
  };

  return (
    <ScrollArea className="mt-2.5 h-full w-full rounded-xl gradient-mask-b-80">
      <div className="relative h-96 w-full overflow-hidden rounded-xl">
        <Image
          alt={playlist ? playlist.name : "Album Cover"}
          src={playlist ? playlist.coverArt : "/coverArt.png"}
          fill
          loading="lazy"
          className="object-cover object-center blur-xl gradient-mask-b-10"
        />
        <Button onClick={() => router.back()} className="absolute left-4 top-4">
          <IconArrowLeft stroke={2} size={16} /> Back
        </Button>
        <div className="absolute bottom-6 left-6">
          <div className="flex items-end gap-4">
            <div className="relative h-52 w-52 overflow-hidden rounded-lg shadow-xl transition duration-300">
              <Image
                alt={playlist ? playlist.name : "Album Cover"}
                src={playlist ? playlist.coverArt : "/coverArt.png"}
                fill
                loading="lazy"
                className="scale-[1.01] object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-medium text-white">
                  {playlist && playlist.name}
                </h1>
                <p className="flex items-center gap-2 text-sm text-white">
                  {playlist && playlist.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={playPlaylist} className="w-fit">
                  <IconPlayerPlay className="fill-white" stroke={2} size={16} />{" "}
                  Play
                </Button>
                <Button className="w-fit" onClick={playPlaylistAndShuffle}>
                  <IconArrowsShuffle2 stroke={2} size={16} /> Shuffle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-32 pt-2">
        {playlist &&
          playlist.songs.map((song, index) => (
            <div
              key={song.id}
              className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-white/10"
              onClick={() => handleMusicClick(index)}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded shadow-xl transition duration-300">
                  <Image
                    alt={playlist && playlist.name}
                    src={playlist && song.album.coverArt}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{song.name}</p>
                  <p className="opacity-50">{song.artist}</p>
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1 opacity-50">
                  <IconClock stroke={2} size={15} />
                  {convertTime(song.duration)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
}
