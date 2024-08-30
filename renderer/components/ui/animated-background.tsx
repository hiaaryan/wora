import { usePlayer } from "@/context/playerContext";

export default function AnimatedBackground(){

  const {
    song
  } = usePlayer();

  return (
    song ? <div className="absolute overflow-hidden w-full h-full">
      <div className="bg-animated">
        <img className="bg-color"
             src={song.album.coverArt} />
        <img className="bg-black"
             src={song.album.coverArt} />
      </div>
    </div> : <></>
  )
}