import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function Albums() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    window.ipc.invoke("get-albums").then((response) => {
      setAlbums(response);
    });
  }, []);

  return (
    <React.Fragment>
      <ScrollArea className="mt-2.5 h-full w-full rounded-xl pt-2 gradient-mask-b-80">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="mt-2 text-base font-medium">Albums</div>
              <div className="opacity-50">
                Hey Aaryan! Ready for a Jam Session?
              </div>
            </div>
            <div className="grid w-full grid-cols-5 gap-8 pb-[33vh]">
              {albums.map((album) => (
                <Link key={album.id} href={`/album/${album.id}`}>
                  <div className="group/album wora-border h-[21rem] cursor-pointer rounded-xl p-5 transition duration-300 hover:bg-white/10">
                    <div className="flex h-full flex-col justify-between">
                      <div className="relative h-2/3 w-full overflow-hidden rounded-xl shadow-xl transition duration-300">
                        <Image
                          alt={album.name}
                          src={album.coverArt}
                          fill
                          loading="lazy"
                          className="object-cover"
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
    </React.Fragment>
  );
}
