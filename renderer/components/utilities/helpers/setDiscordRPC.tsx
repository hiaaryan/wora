interface DiscordState {
  details: string;
  state: string;
}

const defaultState: DiscordState = {
  details: "Music Player for Audiophiles 🎧",
  state: "Idle... 💤",
};

const updateDiscordState = (metadata: any, isPlaying: boolean): void => {
  if (!isPlaying || !metadata) {
    window.ipc.send("set-rpc-state", defaultState);
    return;
  }

  const details = `${metadata.common.title} → ${metadata.common.album}`;
  const state = `by ${metadata.common.artist}`;

  window.ipc.send("set-rpc-state", { details, state });
};

export const resetDiscordState = (): void => {
  window.ipc.send("set-rpc-state", defaultState);
};

export default updateDiscordState;
