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
      <div className="group/album wora-border wora-transition rounded-2xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
        <div className="relative flex flex-col justify-between">
          <div className="relative w-full overflow-hidden rounded-xl pb-[100%] shadow-lg">
            <Image
              alt={album ? album.name : "Album Cover"}
              src={album.coverArt}
              fill
              loading="lazy"
              className="z-10 object-cover"
              quality={10}
            />
          </div>
          <div className="mt-8 flex w-full flex-col overflow-clip">
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
