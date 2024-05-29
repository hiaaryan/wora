import axios from "axios";

export const handleLyrics = async (title: string, duration: number) => {
  try {
    const response = await axios.get("https://lrclib.net/api/search", {
      params: { track_name: title },
    });

    const songs = response.data;

    // Filter songs by title and duration
    const matchedSongs = songs.filter(
      (song: any) =>
        Math.abs(song.duration - duration) <= 5 &&
        (song.syncedLyrics !== null || song.plainLyrics !== null),
    );

    if (matchedSongs.length === 0) {
      return null;
    }

    matchedSongs.sort((a: any, b: any) => {
      if (a.syncedLyrics && !b.syncedLyrics) {
        return -1;
      } else if (!a.syncedLyrics && b.syncedLyrics) {
        return 1;
      } else {
        return 0;
      }
    });

    if (matchedSongs[0].syncedLyrics) {
      return matchedSongs[0].syncedLyrics;
    } else if (matchedSongs[0].plainLyrics) {
      return matchedSongs[0].plainLyrics;
    }
  } catch (error) {
    console.error("Error Fetching Lyrics:", error);
  }
};
