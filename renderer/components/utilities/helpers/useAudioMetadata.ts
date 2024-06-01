import { useState, useEffect } from "react";
import { fetchMetadata, fetchLyrics } from "./fetchFromApi";
import { IAudioMetadata } from "music-metadata-browser";

const useAudioMetadata = (file: string) => {
  const [data, setData] = useState<IAudioMetadata | null>(null);
  const [cover, setCover] = useState("https://iili.io/HlHy9Yx.png");
  const [lyrics, setLyrics] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchMetadata(file);
        setData(response.metadata);
        setCover(response.art);
        const fetchedLyrics = await fetchLyrics(
          `${response.metadata.common.title} ${response.metadata.common.artist}`,
          response.metadata.format.duration,
        );
        setLyrics(fetchedLyrics);
      } catch (error) {
        console.error("Failed to fetch metadata: ", error.message);
      }
    };
    getData();
  }, [file]);

  return { data, cover, lyrics };
};

export default useAudioMetadata;
