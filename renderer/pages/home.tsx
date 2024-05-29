import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Head from "next/head";

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Home</title>
      </Head>
      <ScrollArea className="h-full mt-2 w-[88.15vw]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col leading-tight">
              <div className="text-base mt-2.5">Home</div>
              <div className="opacity-50">
                Hey Aaryan! Ready for a Jam Session?
              </div>
            </div>
            <div className="relative flex w-full gap-8 h-72">
              <div className="group/album hover:bg-black/5 dark:hover:bg-white/10 transition duration-300 w-52 p-5 wora-border rounded-xl cursor-pointer">
                <div className="h-full flex flex-col justify-between">
                  <div className="relative h-2/3 rounded-xl overflow-hidden shadow-xl transition duration-300 w-full">
                    <Image
                      alt="album"
                      src={"/images/bills.jpeg"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                      Never Say Die
                    </p>
                    <p className="opacity-50">CHVRCHES</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-96 flex flex-col gap-2 w-[87.5vw] items-center justify-center">
          <Image
            alt="wora"
            src="/wora.svg"
            className="mix-blend-difference"
            width={50}
            height={50}
          />
          <p>Made with ❤️ by Aaryan.</p>
        </div>
      </ScrollArea>
    </React.Fragment>
  );
}
