import {
  IconArrowsShuffle2,
  IconFocusCentered,
  IconInbox,
  IconSearch,
  IconSquare,
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command";
import React from "react";
import Link from "next/link";

function Navbar() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const openSearch = () => {
    setOpen(true);
  };

  return (
    <div className="wora-border h-full w-20 rounded-xl p-6">
      <div className="flex h-full flex-col gap-8">
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
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <span>Launch</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Mail</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </div>
  );
}

export default Navbar;
