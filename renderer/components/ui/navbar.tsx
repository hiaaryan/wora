import {
  IconFocusCentered,
  IconInbox,
  IconSearch,
  IconVinyl,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePlayer } from "@/context/playerContext";
import Spinner from "./spinner";

const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    setLoading(true);

    if (!search) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      window.ipc.invoke("search", search).then((response) => {
        const albums = response.searchAlbums;
        const playlists = response.searchPlaylists;
        const songs = response.searchSongs;

        setSearchResults([
          ...playlists.map((playlist) => ({ ...playlist, type: "Playlist" })),
          ...albums.map((album) => ({ ...album, type: "Album" })),
          ...songs.map((song) => ({ ...song, type: "Song" })),
        ]);

        setLoading(false);
      });
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openSearch = () => setOpen(true);

  const handleItemClick = (item) => {
    if (item.type === "Album") {
      router.push(`/albums/${item.id}`);
    } else if (item.type === "Song") {
      setQueueAndPlay([item], 0);
    }
    setOpen(false);
  };

  return (
    <div className="wora-border h-full w-20 rounded-xl p-6">
      <div className="flex h-full flex-col items-center gap-8">
        <TooltipProvider>
          <div className="flex flex-col">
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Link href="/settings">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ak.jpeg" />
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={50}>
                <p>Aaryan Kapoor</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col items-center gap-8">
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" asChild>
                  <Link href="/home">
                    <IconInbox stroke={2} className="w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" asChild onClick={openSearch}>
                  <IconSearch stroke={2} className="w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" asChild>
                  <Link href="/playlists">
                    <IconVinyl stroke={2} className="w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Playlists</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" asChild>
                  <Link href="/albums">
                    <IconFocusCentered stroke={2} className="w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Albums</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command>
            <CommandInput
              placeholder="Search for a song, artist, album or playlist..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex h-[325px] w-full items-center justify-center text-white">
                  <Spinner />
                </div>
              )}
              {search && !loading && (
                <CommandGroup heading="Search Results" className="pb-2">
                  {searchResults.map((item) => (
                    <CommandItem
                      key={`${item.type}-${item.id}`}
                      value={`${item.name}-${item.type}-${item.id}`}
                      onSelect={() => handleItemClick(item)}
                    >
                      <div className="flex h-full w-full items-center gap-2.5 gradient-mask-r-70">
                        {item.type === "Album" && (
                          <div className="relative h-12 w-12 overflow-hidden rounded shadow-xl transition duration-300">
                            <Image src={item.coverArt} alt={item.name} fill />
                          </div>
                        )}
                        <div>
                          <p className="w-full overflow-hidden text-xs">
                            {item.name}
                            <span className="ml-1 opacity-50">
                              ({item.type})
                            </span>
                          </p>
                          <p className="w-full text-xs opacity-50">
                            {item.type === "Playlist"
                              ? item.description
                              : item.artist}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </div>
  );
};

export default Navbar;
