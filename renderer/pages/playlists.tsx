import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Playlists() {
  return (
    <ScrollArea className="mt-2.5 h-full w-[88.15vw] gradient-mask-b-70">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <div className="mt-4 text-base font-medium">Home</div>
            <div className="opacity-50">
              Hey Aaryan! Ready for a Jam Session?
            </div>
          </div>
          <div className="relative flex h-72 w-full gap-8">
            <div className="wora-border h-48 w-1/2 rounded-xl p-6"></div>
            <div className="wora-border h-48 w-1/2 rounded-xl p-6"></div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
