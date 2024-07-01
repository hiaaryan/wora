import Actions from "@/components/ui/actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/router";
import Spinner from "@/components/ui/spinner";
import { useState } from "react";

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setLoading(true);
    window.ipc
      .invoke("setMusicFolder", true)
      .then((response) => {
        if (response) return;
        router.push("/home");
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="wora-transition h-screen w-screen">
      <Actions />
      <div className="relative flex h-full w-full select-none items-center overflow-hidden p-8">
        <div className="absolute -bottom-36 -left-32 h-96 w-96 rounded-full bg-white blur-[1700px]" />
        <div className="z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Image
              src="/assets/Full [Dark].png"
              width={124}
              height={0}
              alt="logo"
            />
            <div className="flex items-center text-sm opacity-50">
              A beautiful player for audiophiles 🎧
            </div>
          </div>
          <Button
            className="absolute bottom-8 left-8 w-40 justify-between"
            onClick={handleClick}
          >
            Get Started
            {loading ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <IconArrowRight stroke={2} className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
