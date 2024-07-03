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
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { usePlayer } from "@/context/playerContext";
import { ContextMenu } from "@radix-ui/react-context-menu";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

type Song = {
  id: number;
  filePath: string;
  name: string;
  artist: string;
  duration: number;
  album: any;
};

type Album = {
  name: string;
  artist: string;
  year: number;
  coverArt: string;
  songs: Song[];
};

export default function Album() {
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [playlists, setPlaylists] = useState([]);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    if (!router.query.slug) return;

    window.ipc
      .invoke("getAlbumWithSongs", router.query.slug)
      .then((response) => {
        setAlbum(response);
      });

    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, [router.query.slug]);

  const handleMusicClick = (index: number) => {
    if (album) {
      setQueueAndPlay(album.songs, index);
    }
  };

  const playAlbum = () => {
    if (album) {
      setQueueAndPlay(album.songs, 0);
    }
  };

  const playAlbumAndShuffle = () => {
    if (album) {
      setQueueAndPlay(album.songs, 0, true);
    }
  };

  const addSongToPlaylist = (playlistId: number, songId: number) => {
    window.ipc
      .invoke("addSongToPlaylist", {
        playlistId,
        songId,
      })
      .then((response) => {
        if (response === true) {
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconCheck stroke={2} size={16} />
              Song is added to playlist.
            </div>,
          );
        } else {
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconX stroke={2} size={16} />
              Song already exists in playlist.
            </div>,
          );
        }
      });
  };

  return (
    <ScrollArea className="mt-2.5 h-full w-full rounded-xl gradient-mask-b-80">
      <div className="relative h-96 w-full overflow-hidden rounded-xl">
        <Image
          alt={album ? album.name : "Album Cover"}
          src={album ? album.coverArt : "/coverArt.png"}
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
                alt={album ? album.name : "Album Cover"}
                src={album ? album.coverArt : "/coverArt.png"}
                fill
                loading="lazy"
                className="scale-[1.01] object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-medium text-white">
                  {album && album.name}
                </h1>
                <p className="flex items-center gap-2 text-sm text-white">
                  {album && album.artist}{" "}
                  <IconCircleFilled stroke={2} size={5} />{" "}
                  {album && album.year ? album.year : "Unknown"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={playAlbum} className="w-fit">
                  <IconPlayerPlay className="fill-white" stroke={2} size={16} />{" "}
                  Play
                </Button>
                <Button className="w-fit" onClick={playAlbumAndShuffle}>
                  <IconArrowsShuffle2 stroke={2} size={16} /> Shuffle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-[32vh] pt-2">
        {album &&
          album.songs.map((song, index) => (
            <ContextMenu key={song.id}>
              <ContextMenuTrigger>
                <div
                  className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-white/10"
                  onClick={() => handleMusicClick(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded shadow-xl transition duration-300">
                      <Image
                        alt={album && album.name}
                        src={album && album.coverArt}
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
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem
                  className="flex items-center gap-2"
                  onClick={() => handleMusicClick(index)}
                >
                  <IconPlayerPlay className="fill-white" stroke={2} size={14} />
                  Play Song
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger className="flex items-center gap-2">
                    <IconPlus stroke={2} size={14} />
                    Add to Playlist
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-52">
                    {playlists.map((playlist) => (
                      <ContextMenuItem
                        key={playlist.id}
                        onClick={() => addSongToPlaylist(playlist.id, song.id)}
                      >
                        <p className="w-full text-nowrap gradient-mask-r-70">
                          {playlist.name}
                        </p>
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </ContextMenuContent>
            </ContextMenu>
          ))}
      </div>
    </ScrollArea>
  );
}
