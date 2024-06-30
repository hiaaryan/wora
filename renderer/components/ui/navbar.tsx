import {
  IconArrowRight,
  IconFocusCentered,
  IconInbox,
  IconPlus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Playlist name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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
          ...playlists.map((playlist: any) => ({
            ...playlist,
            type: "Playlist",
          })),
          ...albums.map((album: any) => ({ ...album, type: "Album" })),
          ...songs.map((song: any) => ({ ...song, type: "Song" })),
        ]);

        setLoading(false);
      });
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openSearch = () => setOpen(true);

  const handleItemClick = (item: any) => {
    if (item.type === "Album") {
      router.push(`/albums/${item.id}`);
    } else if (item.type === "Song") {
      setQueueAndPlay([item], 0);
    }
    setOpen(false);
  };

  const createPlaylist = (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    window.ipc
      .invoke("createPlaylist", data)
      .then((response) => {
        setDialogOpen(false);
        setLoading(false);
        router.push(`/playlists/${response.lastInsertRowid}`);
      })
      .catch(() => setLoading(false));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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
            <Tooltip delayDuration={0}>
              <TooltipTrigger onClick={() => setDialogOpen(true)}>
                <Button variant="ghost" asChild>
                  <IconPlus stroke={2} className="w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={55}>
                <p>Create Playlist</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <div className="flex h-full w-full items-start gap-6">
              <div className="jusitfy-between flex h-full w-full flex-col gap-4">
                <DialogHeader>
                  <DialogTitle>Create Playlist</DialogTitle>
                  <DialogDescription>
                    Add a new playlist to your library.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(createPlaylist)}
                    className="flex gap-4 text-xs"
                  >
                    <div className="h-full">
                      <div className="relative h-36 w-36 overflow-hidden rounded-lg">
                        <Image
                          alt="album"
                          src="/coverArt.png"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex h-full w-full flex-col items-end gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        className="w-fit justify-between text-xs"
                        type="submit"
                      >
                        Create Playlist
                        {loading ? (
                          <Spinner className="h-3.5 w-3.5" />
                        ) : (
                          <IconArrowRight stroke={2} className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                  <Spinner className="h-8 w-8" />
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
