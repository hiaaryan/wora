import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { usePlayer } from "@/context/playerContext";
import { Button } from "@/components/ui/button";
import { convertTime } from "@/lib/helpers";
import { IconCircleFilled, IconClock } from "@tabler/icons-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type Album = {
  name: string;
  artist: string;
  year: number;
  coverArt: string;
};

export default function Album() {
  const router = useRouter();

  const [album, setAlbum] = useState<Album | null>({
    name: "",
    artist: "",
    year: 0,
    coverArt: "/coverArt.png",
  });
  const [songs, setSongs] = useState([]);

  const { setFile } = usePlayer();

  useEffect(() => {
    window.ipc.invoke("get-album-songs", router.query.slug).then((response) => {
      setAlbum(response.album[0]);
      setSongs(response.songs);
    });
  }, [router.query.slug]);

  const handleMusicClick = (fileUrl: string) => {
    setFile(fileUrl);
  };

  return (
    <ScrollArea className="mt-2.5 h-full w-full rounded-xl gradient-mask-b-80">
      <div className="relative h-96 w-full overflow-hidden rounded-xl">
        <Image
          alt={album && album.name}
          src={album ? album.coverArt : "/coverArt.png"}
          fill
          loading="lazy"
          className="object-cover object-center blur-xl gradient-mask-b-10"
        />
        <Button
          onClick={() => router.back()}
          className="absolute left-4 top-4"
          variant="secondary"
        >
          Back
        </Button>
        <div className="absolute bottom-6 left-6">
          <div className="flex items-end">
            <div className="relative h-52 w-52 overflow-hidden rounded-lg shadow-xl transition duration-300">
              <Image
                alt={album && album.name}
                src={album ? album.coverArt : "/coverArt.png"}
                fill
                loading="lazy"
                className="scale-[1.01] object-cover"
              />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-medium text-white">
                {album && album.name}
              </h1>
              <p className="flex items-center gap-2 text-sm text-white">
                {album && album.artist} <IconCircleFilled stroke={2} size={5} />{" "}
                {album && album.year}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-32 pt-2">
        {songs.map((song) => (
          <div>
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-white/10"
                  onClick={() => handleMusicClick(song.filePath)}
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
                <ContextMenuItem inset>
                  Back
                  <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset disabled>
                  Forward
                  <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset>
                  Reload
                  <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
