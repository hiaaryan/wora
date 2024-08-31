import { useState, useEffect } from "react";
import { Song, usePlayer } from "@/context/playerContext";

export default function AnimatedBackground() {
  const { song } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (song && (!songs.length || song.id !== songs[songs.length - 1].id)) {
      if(songs.length > 1) setSongs([...songs.slice(2), song]);
      else setSongs([...songs, song]);
    }
  }, [song]);

  return (
    songs.length > 0 ? (
      <div className="absolute overflow-hidden w-full h-full">
        <div className="bg-animated">
          <Backgrounds song={songs[songs.length - 1]} onAnimationEnd={null} />
          {songs.length > 1 && (
            <Backgrounds song={songs[songs.length - 2]} onAnimationEnd={() => setSongs(songs.slice(1))} />
          )}
        </div>
      </div>
    ) : null
  );
}

function Backgrounds({ song, onAnimationEnd }: { song: Song, onAnimationEnd: (() => void) | null }) {
  return (
    <div className={onAnimationEnd ? "bg-fade-out" : "bg-fade-in z-1"} onAnimationEnd={onAnimationEnd}>
      <img className="bg-color" src={song.album.coverArt} alt="Album Cover" />
      <img className="bg-black" src={song.album.coverArt} alt="Album Cover" />
    </div>
  );
}
