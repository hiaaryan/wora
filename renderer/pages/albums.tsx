"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function Albums() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    window.ipc.invoke("getAllAlbums").then((response) => {
      setAlbums(response);
    });
  }, []);

  return (
    <ScrollArea className="mt-2.5 h-full w-full gradient-mask-b-80">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <div className="mt-4 text-base font-medium">Albums</div>
            <div className="opacity-50">
              Hey Aaryan! Ready for a Jam Session?
            </div>
          </div>
          <div className="grid w-full grid-cols-5 gap-8 pb-[33vh]">
            {albums.map((album) => (
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
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
