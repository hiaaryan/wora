import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { convertTime } from "@/lib/helpers";
import {
  IconClock,
  IconPlayerPlay,
  IconArrowsShuffle2,
  IconArrowLeft,
  IconX,
  IconCheck,
  IconPencil,
  IconStar,
  IconArrowRight,
} from "@tabler/icons-react";
import { usePlayer } from "@/context/playerContext";
import { ContextMenu } from "@radix-ui/react-context-menu";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Spinner from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "components/ui/input";
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

type Song = {
  id: number;
  filePath: string;
  name: string;
  artist: string;
  duration: number;
  album: {
    name: string;
    coverArt: string;
  };
};

type Playlist = {
  id: number;
  name: string;
  description: string;
  coverArt: string;
  songs: Song[];
};

export default function Playlist() {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setQueueAndPlay } = usePlayer();

  useEffect(() => {
    if (!router.query.slug) return;
    window.ipc
      .invoke("getPlaylistWithSongs", router.query.slug)
      .then((response) => {
        setLoading(false);
        setPlaylist(response);
      });
  }, [router.query.slug]);

  const handleMusicClick = (index: number) => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, index);
    }
  };

  const playPlaylist = () => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, 0);
    }
  };

  const playPlaylistAndShuffle = () => {
    if (playlist) {
      setQueueAndPlay(playlist.songs, 0, true);
    }
  };

  const removeSongFromPlaylist = (playlistId: number, songId: number) => {
    window.ipc
      .invoke("removeSongFromPlaylist", {
        playlistId,
        songId,
      })
      .then((response) => {
        if (response) {
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconX stroke={2} size={16} />
              Song removed from playlist.
            </div>,
          );

          window.ipc
            .invoke("getPlaylistWithSongs", router.query.slug)
            .then((response) => {
              setPlaylist(response);
            });
        }
      });
  };

  const updatePlaylist = (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    window.ipc
      .invoke("updatePlaylist", { id: playlist.id, data })
      .then((response) => {
        if (response) {
          window.ipc
            .invoke("getPlaylistWithSongs", router.query.slug)
            .then((response) => {
              setPlaylist(response);
            });
          setDialogOpen(false);
          setLoading(false);
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconCheck stroke={2} size={16} />
              Your playlist is now updated.
            </div>,
          );
        }
      })
      .catch(() => setLoading(false));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (playlist) {
      form.reset({
        name: playlist.name,
        description: playlist.description,
      });
    }
  }, [playlist]);

  return (
    <ScrollArea className="mt-2.5 h-full w-full rounded-xl gradient-mask-b-80">
      <Toaster position="top-right" />
      <div className="relative h-96 w-full overflow-hidden rounded-xl">
        {playlist && playlist.id === 1 ? (
          <div className="h-full w-full bg-red-500 gradient-mask-b-10"></div>
        ) : (
          <Image
            alt={playlist ? playlist.name : "Album Cover"}
            src={playlist ? playlist.coverArt : "/coverArt.png"}
            fill
            loading="lazy"
            className="object-cover object-center blur-xl gradient-mask-b-10"
          />
        )}
        <Button onClick={() => router.back()} className="absolute left-4 top-4">
          <IconArrowLeft stroke={2} size={16} /> Back
        </Button>
        <div className="absolute bottom-6 left-6">
          <div className="flex items-end gap-4">
            <div className="relative h-52 w-52 overflow-hidden rounded-lg shadow-xl transition duration-300">
              <Image
                alt={playlist ? playlist.name : "Album Cover"}
                src={playlist ? playlist.coverArt : "/coverArt.png"}
                fill
                loading="lazy"
                className="scale-[1.01] object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-medium text-white">
                  {playlist && playlist.name}
                </h1>
                <p className="flex items-center gap-2 text-sm text-white">
                  {playlist && playlist.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={playPlaylist} className="w-fit">
                  <IconPlayerPlay className="fill-white" stroke={2} size={16} />{" "}
                  Play
                </Button>
                <Button className="w-fit" onClick={playPlaylistAndShuffle}>
                  <IconArrowsShuffle2 stroke={2} size={16} /> Shuffle
                </Button>
                {playlist && playlist.id !== 1 && (
                  <Button className="w-fit" onClick={() => setDialogOpen(true)}>
                    <IconStar stroke={2} size={16} /> Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-32 pt-2">
        {playlist &&
          playlist.songs.map((song, index) => (
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  key={song.id}
                  className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-white/10"
                  onClick={() => handleMusicClick(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded shadow-xl transition duration-300">
                      <Image
                        alt={song.name}
                        src={song.album.coverArt}
                        fill
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{song.name}</p>
                      <p className="opacity-50">{song.artist}</p>
                    </div>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 opacity-50">
                      <IconClock stroke={2} size={15} />
                      {convertTime(song.duration)}
                    </p>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem
                  className="flex items-center gap-2"
                  onClick={() => handleMusicClick(index)}
                >
                  <IconPlayerPlay className="fill-white" stroke={2} size={14} />
                  Play Song
                </ContextMenuItem>
                <ContextMenuItem
                  className="flex items-center gap-2"
                  onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                >
                  <IconX stroke={2} size={14} />
                  Remove from Playlist
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <div className="flex h-full w-full items-start gap-6">
            <div className="jusitfy-between flex h-full w-full flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Update Playlist</DialogTitle>
                <DialogDescription>
                  Update your existing playlist.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(updatePlaylist)}
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
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      className="w-fit justify-between text-xs"
                      type="submit"
                    >
                      Update Playlist
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
    </ScrollArea>
  );
}
