import Image from "next/image";
import Link from "next/link";
import React from "react";

type Album = {
  id: string;
  name: string;
  artist: string;
  coverArt: string;
};

type AlbumCardProps = {
  album: Album;
};

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link href={`/albums/${album.id}`} passHref>
      <div className="group/album wora-border wora-transition h-[21rem] rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
        <div className="relative flex h-full flex-col justify-between">
          <div className="relative h-2/3 w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              alt={album ? album.name : "Album Cover"}
              src={album.coverArt}
              fill
              loading="lazy"
              className="z-10 object-cover"
            />
          </div>
          <div className="flex w-full flex-col">
            <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
              {album.name}
            </p>
            <p className="text-nowrap opacity-50 gradient-mask-r-70">
              {album.artist}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
