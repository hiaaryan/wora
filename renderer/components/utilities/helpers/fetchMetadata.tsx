import * as mm from "music-metadata-browser";
import { IAudioMetadata } from "music-metadata-browser";

interface MetadataResponse {
  metadata: IAudioMetadata;
  art: string;
}

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
