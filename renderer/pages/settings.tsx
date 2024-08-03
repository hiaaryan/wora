import React, { useEffect, useState, useRef } from "react";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters long.",
  }),
  profilePicture: z.any().optional(),
});

type Settings = {
  name: string;
  profilePicture: string;
  musicFolder: string;
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [stats, setStats] = useState<{
    songs: number;
    albums: number;
    playlists: number;
  } | null>(null);

  useEffect(() => {
    window.ipc.invoke("getSettings").then((response) => {
      setSettings(response);
      setPreviewUrl(
        response?.profilePicture
          ? `wora://${response.profilePicture}`
          : "/userPicture.png",
      );
    });

    window.ipc.invoke("getLibraryStats").then((response) => {
      setStats(response);
    });
  }, []);

  const updateSettings = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    let profilePicturePath = settings?.profilePicture;

    if (
      data.profilePicture &&
      data.profilePicture instanceof FileList &&
      data.profilePicture.length > 0
    ) {
      const file = data.profilePicture[0];
      const fileData = await file.arrayBuffer();
      try {
        profilePicturePath = await window.ipc.invoke("uploadProfilePicture", {
          name: file.name,
          data: Array.from(new Uint8Array(fileData)),
        });
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast(
          <div className="flex w-fit items-center gap-2 text-xs">
            <IconX className="text-red-500" stroke={2} size={16} />
            Failed to upload profile picture. Using existing picture.
          </div>,
        );
        // Fallback to the original profile picture
        profilePicturePath = settings?.profilePicture;
      }
    } else {
      // No new file selected, use the existing profile picture
      profilePicturePath = settings?.profilePicture;
    }

    const updatedData = {
      name: data.name,
      profilePicture: profilePicturePath,
    };

    await window.ipc.invoke("updateSettings", updatedData).then((response) => {
      if (response) {
        setLoading(false);
        setSettings((prevSettings) => ({ ...prevSettings, ...updatedData }));
        toast(
          <div className="flex w-fit items-center gap-2 text-xs">
            <IconCheck className="text-green-400" stroke={2} size={16} />
            Your settings are updated.
          </div>,
        );
      }
    });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name,
        profilePicture: settings.profilePicture,
      });
    }
  }, [settings]);

  const updateMusicFolder = () => {
    setMusicLoading(true);
    window.ipc
      .invoke("setMusicFolder", true)
      .then((response) => {
        setMusicLoading(false);
        if (response) return;
        toast(
          <div className="flex w-fit items-center gap-2 text-xs">
            <IconCheck className="text-green-400" stroke={2} size={16} />
            Your music folder is updated.
          </div>,
        );
        window.ipc.invoke("getSettings").then((response) => {
          setSettings(response);
          setPreviewUrl(
            response?.profilePicture
              ? `wora://${response.profilePicture}`
              : "/userPicture.png",
          );
        });

        window.ipc.invoke("getLibraryStats").then((response) => {
          setStats(response);
        });
      })
      .catch(() => setMusicLoading(false));
  };

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          <div className="mt-4 text-base font-medium">Settings</div>
          <div className="opacity-50">You&apos;re on your own here.</div>
        </div>
        <div className="relative flex w-full flex-col gap-8">
          <div className="flex w-full items-center gap-8">
            <div className="wora-border h-48 w-2/5 rounded-2xl p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(updateSettings)}
                  className="flex h-full flex-col justify-between text-xs"
                >
                  <div className="flex w-full items-center gap-4">
                    <Label
                      className="wora-transition w-fit cursor-pointer hover:opacity-50"
                      htmlFor="profilePicture"
                    >
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={previewUrl} />
                      </Avatar>
                    </Label>
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field: { onChange, value, ...rest } }) => {
                        const fileInputRef = useRef<HTMLInputElement>(null);
                        return (
                          <FormItem hidden className="w-full">
                            <FormControl>
                              <Input
                                id="profilePicture"
                                placeholder="Picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    const file = files[0];
                                    onChange(files);
                                    const objectUrl = URL.createObjectURL(file);
                                    setPreviewUrl(objectUrl);
                                  }
                                }}
                                ref={fileInputRef}
                                {...rest}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {settings && settings.name
                          ? settings.name
                          : "Wora User"}
                      </p>
                      <p className="opacity-50">A great listner of music.</p>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              placeholder="A username would be great."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      className="w-fit justify-between text-xs"
                      type="submit"
                    >
                      Save
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
            <div className="wora-border h-48 w-3/5 rounded-2xl p-6">
              <div className="flex h-full flex-col justify-between text-xs">
                <div className="flex w-full items-center gap-4">
                  <div className="mt-4 flex w-full justify-around">
                    <div className="flex flex-col items-center gap-2">
                      Songs
                      <p className="text-xl font-medium">
                        {stats && stats.songs}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      Albums
                      <p className="text-xl font-medium">
                        {stats && stats.albums}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      Playlists
                      <p className="text-xl font-medium">
                        {stats && stats.playlists}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  <div className="flex h-9 w-full items-center rounded-xl bg-black/5 px-3 py-1 text-xs transition duration-300 focus:outline-none dark:bg-white/10">
                    {settings && settings.musicFolder}
                  </div>
                  <Button
                    className="w-fit justify-between text-nowrap text-xs"
                    onClick={updateMusicFolder}
                  >
                    Update Music Folder
                    {musicLoading ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <IconArrowRight stroke={2} className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
