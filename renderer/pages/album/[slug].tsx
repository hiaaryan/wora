import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { usePlayer } from "@/context/playerContext";
import { Button } from "@/components/ui/button";
type Album = {
  name: string;
  artist: string;
  coverArt: string;
};

export default function Album() {
  const router = useRouter();

  const [album, setAlbum] = useState<Album | null>({
    name: "",
    artist: "",
    coverArt: "/coverArt.png",
  });
  const [songs, setSongs] = useState([]);

  const { setFile } = usePlayer();

  useEffect(() => {
    window.ipc.invoke("get-album-songs", router.query.slug).then((response) => {
      setAlbum(response.album[0]);
      setSongs(response.songs);
    });
  }, []);

  const handleMusicClick = (fileUrl: string) => {
    setFile(fileUrl);
  };

  return (
    <React.Fragment>
      <ScrollArea className="mt-2.5 h-full w-full rounded-xl gradient-mask-b-80">
        <div className="relative h-96 w-full overflow-hidden rounded-xl">
          <Image
            alt={album && album.name}
            src={album ? album.coverArt : "/coverArt.png"}
            fill
            loading="lazy"
            className="object-cover object-center blur-xl"
          />
          <Button
            onClick={() => router.back()}
            className="absolute left-4 top-4"
            variant="secondary"
          >
            Back
          </Button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end">
              <div className="relative h-52 w-52 overflow-hidden rounded-xl shadow-xl transition duration-300">
                <Image
                  alt={album && album.name}
                  src={album ? album.coverArt : "/coverArt.png"}
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">
                  {album && album.name}
                </h1>
                <p className="text-sm text-white">{album && album.artist}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-10">
          {songs.map((song) => (
            <div className="wora-transition flex w-full items-center justify-between rounded-xl p-3 hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded shadow-xl transition duration-300">
                  <Image
                    alt={album && album.name}
                    src={album && album.coverArt}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p>{song.name}</p>
                  <p className="opacity-50">{song.artist}</p>
                </div>
              </div>
              <Button onClick={() => handleMusicClick(song.filePath)}>
                play
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </React.Fragment>
  );
}
