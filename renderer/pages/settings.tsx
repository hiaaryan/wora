import React, { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconX,
} from "@tabler/icons-react";
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters long.",
  }),
  profilePicture: z.any().optional(),
});

type Settings = {
  name: string;
  profilePicture: string;
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);

  useEffect(() => {
    window.ipc.invoke("getSettings").then((response) => {
      setSettings(response);
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
            <IconX stroke={2} size={16} />
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
            <IconCheck stroke={2} size={16} />
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
    console.log("settings", settings);
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
            <IconCheck stroke={2} size={16} />
            Your music folder updated.
          </div>,
        );
      })
      .catch(() => setMusicLoading(false));
  };

  return (
    <ScrollArea className="mt-2.5 h-full w-[88.15vw] gradient-mask-b-70">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <div className="mt-4 text-base font-medium">Settings</div>
            <div className="opacity-50">You&apos;re on your own here.</div>
          </div>
          <div className="relative flex w-full flex-col gap-8">
            <div className="flex w-full items-center gap-8">
              <div className="wora-border h-48 w-1/2 rounded-xl p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(updateSettings)}
                    className="flex h-full gap-4 text-xs"
                  >
                    <div className="h-full">
                      <Avatar className="h-36 w-36">
                        <AvatarImage
                          src={`${settings && settings.profilePicture ? "wora://" + settings.profilePicture : "/userPicture.png"}`}
                        />
                      </Avatar>
                    </div>
                    <div className="flex h-full w-full flex-col items-end justify-end gap-4">
                      <div className="flex w-full flex-col gap-2">
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
                          name="profilePicture"
                          render={({ field: { onChange, value, ...rest } }) => {
                            const fileInputRef = useRef<HTMLInputElement>(null);
                            return (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input
                                    placeholder="Picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        onChange(files);
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
                      </div>
                      <Button
                        className="w-fit justify-between text-xs"
                        type="submit"
                      >
                        Update Settings
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
              <div className="wora-border h-48 w-1/2 rounded-xl p-6">
                <div className="flex h-full w-full flex-col items-center justify-center leading-3">
                  <div className="relative h-14 w-14">
                    <Image fill src={"/assets/Full [Dark].svg"} alt="Logo" />
                  </div>
                  <div className="flex items-center">
                    Made with
                    <IconHeart
                      stroke={2}
                      className="inline-flex h-3.5 fill-red-500 stroke-red-500"
                    />
                    by hiaaryan.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-8">
              <div className="wora-border h-48 w-1/2 rounded-xl p-6">
                <Button
                  className="w-fit justify-between text-xs"
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
              <div className="wora-border h-48 w-1/2 rounded-xl p-6">
                <div className="flex h-full w-full flex-col items-center justify-center leading-3">
                  <div className="relative h-14 w-14">
                    <Image fill src={"/assets/Full [Dark].svg"} alt="Logo" />
                  </div>
                  <div className="flex items-center">
                    Made with
                    <IconHeart
                      stroke={2}
                      className="inline-flex h-3.5 fill-red-500 stroke-red-500"
                    />
                    by hiaaryan.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
