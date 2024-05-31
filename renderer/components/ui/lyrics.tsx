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

const Lyrics: React.FC<LyricsProps> = ({
  lyrics,
  currentLyric,
  onLyricClick,
}) => {
  const lyricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLyric && lyricsRef.current) {
      const currentLine = document.getElementById(`line-${currentLyric.time}`);
      if (currentLine) {
        currentLine.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentLyric]);

  return (
    <div
      className="no-scrollbar gradient-mask-b-40-d h-full w-full overflow-hidden overflow-y-auto py-[19rem] text-3xl font-semibold"
      ref={lyricsRef}
    >
      <div className="flex max-w-3xl flex-col gap-2">
        {lyrics.map((line) => (
          <p
            key={line.time}
            id={`line-${line.time}`}
            className={
              `${currentLyric?.time === line.time ? "font-semibold text-black dark:text-white" : "opacity-40"}` +
              " wora-transition w-fit cursor-pointer rounded-xl p-4 hover:bg-black/5 dark:hover:bg-white/15"
            }
            onClick={() => onLyricClick(line.time)}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Lyrics;
