import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HomePage() {
  return (
    <React.Fragment>
      <ScrollArea className="mt-2.5 h-full w-[88.15vw] gradient-mask-b-70">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="mt-2 text-base font-medium">Home</div>
              <div className="opacity-50">
                Hey Aaryan! Ready for a Jam Session?
              </div>
            </div>
            <div className="relative flex h-72 w-full gap-8">
              <div className="group/album wora-border wora-transition w-52 cursor-pointer rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
                <div className="flex h-full flex-col justify-between">
                  <div className="relative h-2/3 w-full overflow-hidden rounded-xl shadow-xl transition duration-300">
                    <Image
                      alt="album"
                      src={"/images/bills.jpeg"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                      Never Say Die
                    </p>
                    <p className="opacity-50">CHVRCHES</p>
                  </div>
                </div>
              </div>
              <div className="group/album wora-border wora-transition w-52 cursor-pointer rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
                <div className="flex h-full flex-col justify-between">
                  <div className="relative h-2/3 w-full overflow-hidden rounded-xl shadow-xl transition duration-300">
                    <Image
                      alt="album"
                      src={"/images/bills.jpeg"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                      Never Say Die
                    </p>
                    <p className="opacity-50">CHVRCHES</p>
                  </div>
                </div>
              </div>
              <div className="group/album wora-border wora-transition w-52 cursor-pointer rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
                <div className="flex h-full flex-col justify-between">
                  <div className="relative h-2/3 w-full overflow-hidden rounded-xl shadow-xl transition duration-300">
                    <Image
                      alt="album"
                      src={"/images/bills.jpeg"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                      Never Say Die
                    </p>
                    <p className="opacity-50">CHVRCHES</p>
                  </div>
                </div>
              </div>
              <div className="group/album wora-border wora-transition w-52 cursor-pointer rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
                <div className="flex h-full flex-col justify-between">
                  <div className="relative h-2/3 w-full overflow-hidden rounded-xl shadow-xl transition duration-300">
                    <Image
                      alt="album"
                      src={"/images/chamkila.jpeg"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                      Chamkila
                    </p>
                    <p className="opacity-50">A.R. Rahman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </React.Fragment>
  );
}
