import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, []);

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
          <div className="grid w-full grid-cols-5 gap-8 pb-[33vh]">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                <div className="group/album wora-border wora-transition h-[21rem] rounded-xl p-5 hover:bg-white/10">
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="relative h-2/3 w-full overflow-hidden rounded-lg shadow-xl">
                      <Image
                        alt={playlist ? playlist.name : "Album Cover"}
                        src={playlist.coverArt}
                        fill
                        loading="lazy"
                        className="z-10 object-cover"
                      />
                    </div>
                    <div className="flex w-full flex-col">
                      <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                        {playlist.name}
                      </p>
                      <p className="text-nowrap opacity-50 gradient-mask-r-70">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
