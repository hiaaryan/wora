interface DiscordState {
  details: string;
  state?: string;
  timestamp?: boolean;
}

const defaultState: DiscordState = {
  details: "Idle...",
  timestamp: true,
};

const updateDiscordState = (metadata: any): void => {
  if (!metadata) {
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
