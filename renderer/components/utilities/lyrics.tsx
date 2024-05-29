import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Lyrics(lyrics: string, lyricsLine: any) {
  return (
    <div className="!absolute top-0 z-50 bg-white dark:bg-black h-full">
      <ScrollArea className="wora-border rounded-xl bg-white dark:bg-black h-[78vh] w-[88.15vw]"></ScrollArea>
    </div>
  );
}
