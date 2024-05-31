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
      className="overflow-hidden no-scrollbar overflow-y-auto py-[19rem] h-full w-full text-3xl font-semibold gradient-mask-b-40-d"
      ref={lyricsRef}
    >
      <div className="max-w-3xl flex flex-col gap-2">
        {lyrics.map((line) => (
          <p
            key={line.time}
            id={`line-${line.time}`}
            className={
              `${currentLyric?.time === line.time ? "text-black dark:text-white font-semibold" : "opacity-40"}` +
              " w-fit p-4 rounded-xl dark:hover:bg-white/15 hover:bg-black/5 wora-transition cursor-pointer"
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
