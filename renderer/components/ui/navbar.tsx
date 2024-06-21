import {
  IconArrowsShuffle2,
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
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePlayer } from "@/context/playerContext";

const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const { setFile } = usePlayer();

  useEffect(() => {
    const down = (e: any) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    window.ipc.invoke("get-albums").then(setAlbums);
    window.ipc.invoke("get-songs").then(setSongs);
  }, []);

  const openSearch = () => setOpen(true);

  const combinedResults = useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return [
      ...albums
        .filter(
          (album) =>
            album.name.toLowerCase().includes(lowerSearch) ||
            album.artist.toLowerCase().includes(lowerSearch),
        )
        .map((album) => ({ ...album, type: "Album" })),
      ...songs
        .filter(
          (song) =>
            song.name.toLowerCase().includes(lowerSearch) ||
            song.artist.toLowerCase().includes(lowerSearch),
        )
        .map((song) => ({ ...song, type: "Song" })),
    ];
  }, [search, albums, songs]);

  const handleItemClick = (item: any) => {
    if (item.type === "Album") {
      router.push(`/albums/${item.id}`);
    } else if (item.type === "Song") {
      setFile(item.filePath);
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
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ak.jpeg" />
                  <AvatarFallback>AK</AvatarFallback>
                </Avatar>
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
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" asChild>
                  <IconArrowsShuffle2 stroke={2} className="w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Shuffle</p>
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
              {search && (
                <CommandGroup heading="Search Results" className="pb-2">
                  {combinedResults.map((item) => (
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
                            {item.artist}
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
