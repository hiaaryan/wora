interface LyricLine {
  time: number;
  text: string;
}

export const convertTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // Pad seconds with leading zero if less than 10
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  return `${minutes}:${formattedSeconds}`;
};

export const parseLyrics = (lyrics: string): LyricLine[] => {
  return lyrics
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\] (.*)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        let text = match[3].trim();
        if (text === "") {
          text = "...";
        }
        return { time, text };
      }
      return null;
    })
    .filter((line) => line !== null) as LyricLine[];
};

export const isSyncedLyrics = (lyrics: string): boolean => {
  return /\[\d{2}:\d{2}\.\d{2}\]/.test(lyrics);
};
