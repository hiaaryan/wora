import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { convertTime } from "@/lib/helpers";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { usePlayer } from "@/context/playerContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const [libraryItems, setLibraryItems] = useState<any | null>([]);
  const [playlists, setPlaylists] = useState([]);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    window.ipc.invoke("getRandomLibraryItems").then((response) => {
      setLibraryItems(response);
    });

    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, []);

  const handleMusicClick = (index: number) => {
    setQueueAndPlay(libraryItems.songs, index);
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
    <ScrollArea className="mt-2.5 h-full w-[88.15vw] gradient-mask-b-70">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <div className="mt-4 text-base font-medium">Home</div>
            <div className="opacity-50">
              The coolest music library in the world.
            </div>
          </div>
          <Carousel
            className="relative w-[88vw]"
            opts={{
              loop: true,
            }}
          >
            <CarouselPrevious className="absolute left-0 z-50 my-0" />
            <div className="w-full gradient-mask-r-80-d">
              <CarouselContent className="-ml-8">
                {libraryItems.albums &&
                  libraryItems.albums.map((album: any, index: number) => (
                    <CarouselItem key={index} className="basis-1/5 pl-8">
                      <Link key={album.id} href={`/albums/${album.id}`}>
                        <div className="group/album wora-border wora-transition h-[21rem] rounded-xl p-5 hover:bg-white/10">
                          <div className="relative flex h-full flex-col justify-between">
                            <div className="relative h-2/3 w-full overflow-hidden rounded-lg shadow-xl">
                              <Image
                                alt={album ? album.name : "Album Cover"}
                                src={album.coverArt}
                                fill
                                loading="lazy"
                                className="z-10 object-cover"
                              />
                            </div>
                            <div className="flex w-full flex-col">
                              <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                                {album.name}
                              </p>
                              <p className="text-nowrap opacity-50 gradient-mask-r-70">
                                {album.artist}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
              </CarouselContent>
            </div>
            <CarouselNext className="absolute right-0 z-50 my-0" />
          </Carousel>
          <div className="pb-[32vh]">
            {libraryItems.songs &&
              libraryItems.songs.map((song: any, index: number) => (
                <ContextMenu key={song.id}>
                  <ContextMenuTrigger>
                    <div
                      className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-white/10"
                      onClick={() => handleMusicClick(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded shadow-xl transition duration-300">
                          <Image
                            alt={song.album && song.album.name}
                            src={song.album && song.album.coverArt}
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
                      <IconPlayerPlay
                        className="fill-white"
                        stroke={2}
                        size={14}
                      />
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
                            onClick={() =>
                              addSongToPlaylist(playlist.id, song.id)
                            }
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
        </div>
      </div>
    </ScrollArea>
  );
}
