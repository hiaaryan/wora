import { LyricLine } from "@/lib/helpers";
import React, { useEffect, useRef } from "react";
import { Badge } from "../ui/badge";
import { scrollIntoView } from "seamless-scroll-polyfill";

interface LyricsProps {
  lyrics: LyricLine[];
  currentLyric: LyricLine | null;
  onLyricClick: (time: number) => void;
  isSyncedLyrics: boolean;
}

const Lyrics: React.FC<LyricsProps> = React.memo(
  ({ lyrics, currentLyric, onLyricClick, isSyncedLyrics }) => {
    const lyricsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (currentLyric && lyricsRef.current) {
        const currentLine = document.getElementById(
          `line-${currentLyric.time}`,
        );
        if (currentLine) {
          scrollIntoView(
            currentLine,
            {
              behavior: "smooth",
              block: "center",
            },
            {
              duration: 500,
            },
          );
        }
      }
    }, [currentLyric]);

    return (
      <div className="wora-border relative mt-2 h-full w-full rounded-2xl bg-white/70 backdrop-blur-xl dark:bg-black/70">
        <div className="absolute bottom-5 right-6 z-50 flex items-center gap-2">
          <Badge>{isSyncedLyrics ? "Synced" : "Unsynced"}</Badge>
        </div>

        <div className="h-utility overflow-y-auto flex w-full items-center text-balance px-8 gradient-mask-b-70-d text-2xl font-medium">
          <div
            ref={lyricsRef}
            className="w-full py-[33vh] h-full no-scrollbar"
            style={{ overflowY: "auto" }}
          >
            {lyrics.map((line) => (
              <p
                key={line.time}
                id={`line-${line.time}`}
                className={
                  `${currentLyric?.time === line.time ? "scale-125 font-semibold" : "opacity-40"}` +
                  " transform-gpu transition-transform duration-700 my-2 max-w-xl origin-left cursor-pointer rounded-xl p-4 hover:bg-black/5 dark:hover:bg-white/10"
                }
                onClick={() => onLyricClick(line.time)}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

export default Lyrics;
