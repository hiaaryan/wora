import React, { useEffect, useRef } from "react";

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsProps {
  lyrics: LyricLine[];
  currentLyric: LyricLine | null;
  onLyricClick: (time: number) => void;
}

const Lyrics: React.FC<LyricsProps> = React.memo(
  ({ lyrics, currentLyric, onLyricClick }) => {
    const lyricsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (currentLyric && lyricsRef.current) {
        const currentLine = document.getElementById(
          `line-${currentLyric.time}`,
        );
        if (currentLine) {
          currentLine.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, [currentLyric]);

    return (
      <div ref={lyricsRef} style={{ overflowY: "auto" }}>
        {lyrics.map((line) => (
          <p
            key={line.time}
            id={`line-${line.time}`}
            className={
              `${currentLyric?.time === line.time ? "scale-125 font-semibold" : "opacity-40"}` +
              " my-2 max-w-xl origin-left cursor-pointer rounded-xl p-4 transition duration-300 ease-in-out hover:bg-black/5 dark:hover:bg-white/10"
            }
            onClick={() => onLyricClick(line.time)}
          >
            {line.text}
          </p>
        ))}
      </div>
    );
  },
);

export default Lyrics;
