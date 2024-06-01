import { convertTime } from "./utilFunctions";

interface DiscordState {
  details: string;
  state: string;
}

const idleStates: string[] = [
  "Exploring New Genres 🌍",
  "Organizing Playlists 🎶",
  "Rediscovering Classics 🎼",
  "Chillin' with Tunes 🎧",
  "Syncing to the Rhythm 🎵",
  "Grooving to the Beats 🕺",
  "Curating a Mixtape 📼",
  "Jamming Out 🎸",
  "Finding Hidden Gems 💎",
  "Vibing with Vinyls 💿",
];

function getRandomIdleState(): string {
  const randomIndex = Math.floor(Math.random() * idleStates.length);
  return idleStates[randomIndex];
}

const defaultState: DiscordState = {
  details: "Music Player for Audiophiles 🎧",
  state: getRandomIdleState(),
};

const updateDiscordState = (
  metadata: any,
  currentSeek: number,
  isPlaying: boolean,
): void => {
  if (!isPlaying || !metadata) {
    window.ipc.send("set-rpc-state", defaultState);
    return;
  }

  const state = metadata.format.lossless
    ? `[${metadata.format.bitsPerSample}/${(metadata.format.sampleRate / 1000).toFixed(1)}kHz] ${convertTime(Math.round(currentSeek))} / ${convertTime(Math.round(metadata.format.duration))}`
    : `[${metadata.format.container}] ${convertTime(Math.round(currentSeek))} / ${convertTime(Math.round(metadata.format.duration))}`;

  const details = `${metadata.common.title} (${metadata.common.artist})`;

  window.ipc.send("set-rpc-state", { details, state });
};

export const resetDiscordState = (): void => {
  window.ipc.send("set-rpc-state", defaultState);
};

export default updateDiscordState;
