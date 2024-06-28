import { shuffleArray } from "@/lib/helpers";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

interface Song {
  id: number;
  name: string;
  artist: string;
  duration: number;
  filePath: string;
  album: {
    name: string;
    coverArt: string;
  };
}

interface PlayerState {
  song: Song | null;
  queue: Song[];
  originalQueue: Song[];
  history: Song[];
  currentIndex: number;
  repeat: boolean;
  shuffle: boolean;
}

interface PlayerContextType extends PlayerState {
  setSong: (song: Song) => void;
  setQueueAndPlay: (
    songs: Song[],
    startIndex?: number,
    shuffle?: boolean,
  ) => void;
  nextSong: () => void;
  previousSong: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const initialPlayerState: PlayerState = {
  song: null,
  queue: [],
  originalQueue: [],
  history: [],
  currentIndex: 0,
  repeat: false,
  shuffle: false,
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playerState, setPlayerState] =
    useState<PlayerState>(initialPlayerState);

  useEffect(() => {
    // @hiaaryan: Load repeat and shuffle settings from localStorage on component mount.
    const savedRepeat = localStorage.getItem("repeat");

    if (savedRepeat !== null) {
      setPlayerState((prevState) => ({
        ...prevState,
        repeat: JSON.parse(savedRepeat),
      }));
    }
  }, []);

  useEffect(() => {
    // @hiaaryan: Save repeat setting to localStorage whenever it changes.
    localStorage.setItem("repeat", JSON.stringify(playerState.repeat));
  }, [playerState.repeat]);

  useEffect(() => {
    // @hiaaryan: Save shuffle setting to localStorage whenever it changes.
    localStorage.setItem("shuffle", JSON.stringify(playerState.shuffle));
  }, [playerState.shuffle]);

  const setQueueAndPlay = useCallback(
    (songs: Song[], startIndex: number = 0, shuffle: boolean = false) => {
      // @hiaaryan: Set the queue and play the song at startIndex, optionally shuffle the queue.
      const shuffledQueue = shuffle
        ? shuffleArray(songs.slice())
        : songs.slice();
      setPlayerState({
        ...initialPlayerState,
        queue: shuffledQueue,
        originalQueue: songs,
        currentIndex: startIndex,
        song: shuffledQueue[startIndex],
        shuffle,
      });
    },
    [],
  );

  const nextSong = useCallback(() => {
    // @hiaaryan: Play the next song in the queue, handle repeat logic.
    setPlayerState((prevState) => {
      const { currentIndex, queue, repeat, history } = prevState;
      if (repeat) {
        return { ...prevState, song: queue[currentIndex] };
      } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex < queue.length) {
          return {
            ...prevState,
            currentIndex: nextIndex,
            history: [...history, queue[currentIndex]],
            song: queue[nextIndex],
          };
        } else {
          return prevState;
        }
      }
    });
  }, []);

  const previousSong = useCallback(() => {
    // @hiaaryan: Play the previous song in history, handle repeat logic.
    setPlayerState((prevState) => {
      const { queue, repeat, history } = prevState;
      if (repeat) {
        return { ...prevState, song: queue[prevState.currentIndex] };
      } else if (history.length > 0) {
        const previous = history[history.length - 1];
        return {
          ...prevState,
          history: history.slice(0, -1),
          song: previous,
          currentIndex: queue.indexOf(previous),
        };
      } else {
        return prevState;
      }
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    // @hiaaryan: Toggle the repeat mode, disable shuffle if repeat is enabled.
    setPlayerState((prevState) => {
      const newRepeat = !prevState.repeat;

      return {
        ...prevState,
        repeat: newRepeat,
        shuffle: newRepeat ? false : prevState.shuffle,
      };
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    // @hiaaryan: Toggle the shuffle mode, update the queue to reflect shuffling or original order.
    setPlayerState((prevState) => {
      const newShuffle = !prevState.shuffle;
      const currentSong = prevState.song;
      let newQueue: any;
      let newIndex: any;

      if (newShuffle) {
        // @hiaaryan: Shuffle the queue and disable repeat.
        const remainingSongs = prevState.originalQueue.filter(
          (song) => song.id !== currentSong?.id,
        );
        newQueue = [currentSong!, ...shuffleArray(remainingSongs)];
      } else {
        // @hiaaryan: Restore the original queue.
        newQueue = prevState.originalQueue.slice();
      }

      newIndex = newQueue.indexOf(currentSong!);

      return {
        ...prevState,
        shuffle: newShuffle,
        queue: newQueue,
        currentIndex: newIndex,
        repeat: newShuffle ? false : prevState.repeat,
      };
    });
  }, []);

  const contextValue: PlayerContextType = {
    ...playerState,
    setSong: (song: Song) =>
      // @hiaaryan: Update the currently playing song.
      setPlayerState((prevState) => ({ ...prevState, song })),
    setQueueAndPlay,
    nextSong,
    previousSong,
    toggleRepeat,
    toggleShuffle,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
