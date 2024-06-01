import axios from "axios";
import * as mm from "music-metadata-browser";
import { IAudioMetadata } from "music-metadata-browser";

interface MetadataResponse {
  metadata: IAudioMetadata;
  art: string;
}

export const fetchLyrics = async (query: string, duration: number) => {
  try {
    const response = await axios.get("https://lrclib.net/api/search", {
      params: { q: query },
    });

    const songs = response.data;

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
    return null;
  }
};

export const fetchMetadata = async (
  file: string,
): Promise<MetadataResponse> => {
  try {
    const metadata = await mm.fetchFromUrl("music://" + file, {
      skipPostHeaders: true,
    });

    const coverArt = mm.selectCover(metadata.common.picture);

    const art = coverArt
      ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
      : "https://iili.io/HlHy9Yx.png";

    return { metadata, art };
  } catch (error) {
    console.log("Error fetching metadata:", error.message);
  }
};
