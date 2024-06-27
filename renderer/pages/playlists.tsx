import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { IconHeart, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, []);

  const favouritesPlaylist = playlists.find((playlist) => playlist.id === 1);

  return (
    <ScrollArea className="mt-2.5 h-full w-[88.15vw] gradient-mask-b-70">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <div className="mt-4 text-base font-medium">Playlists</div>
            <div className="opacity-50">
              Hey Aaryan! Ready for a Jam Session?
            </div>
          </div>
          <div className="relative flex h-48 w-full gap-8">
            <Link
              href="/playlists/1"
              className="wora-transition wora-border flex h-full w-1/2 items-end gap-4 rounded-xl p-6 hover:bg-white/10"
            >
              <div className="flex h-full w-40 items-center justify-center rounded-lg bg-red-500 shadow-xl">
                <IconHeart size={72} className="fill-white" />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-xl font-medium text-white">
                    {favouritesPlaylist?.name}
                  </h1>
                  <p className="flex items-center gap-2 text-sm text-white">
                    {favouritesPlaylist?.description}
                  </p>
                </div>
              </div>
            </Link>
            <div className="wora-transition wora-border flex h-full w-1/2 items-end gap-4 rounded-xl p-6 hover:bg-white/10">
              <div className="flex h-full w-40 items-center justify-center rounded-lg bg-blue-500 shadow-xl">
                <IconPlus size={72} className="fill-white" />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-xl font-medium text-white">
                    New Playlist
                  </h1>
                  <p className="flex items-center gap-2 text-sm text-white">
                    A New Collection of Your Songs 💿
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
