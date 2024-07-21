import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AlbumCard from "@/components/ui/album";

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
            <div className="opacity-50">All of your albums in one place.</div>
          </div>
          <div className="grid w-full grid-cols-5 gap-8 pb-[32vh]">
            {albums && albums.map((album) => <AlbumCard album={album} />)}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
