import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  IconCircleFilled,
  IconPlayerPlay,
  IconArrowsShuffle2,
  IconArrowLeft,
} from "@tabler/icons-react";
import { usePlayer } from "@/context/playerContext";
import { toast } from "sonner";
import Songs from "@/components/ui/songs";

type Album = {
  name: string;
  artist: string;
  year: number;
  coverArt: string;
  songs: any;
};

export default function Album() {
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    if (!router.query.slug) return;

    window.ipc
      .invoke("getAlbumWithSongs", router.query.slug)
      .then((response) => {
        setAlbum(response);
      });
  }, [router.query.slug]);

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
            <div className="relative h-52 w-52 overflow-hidden rounded-lg shadow-lg transition duration-300">
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
                <h1 className="text-2xl font-medium">{album && album.name}</h1>
                <p className="flex items-center gap-2 text-sm">
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
        <Songs library={album?.songs} />
      </div>
    </ScrollArea>
  );
}
