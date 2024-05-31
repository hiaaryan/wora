import { Maven_Pro } from "next/font/google";
import "../styles/globals.css";
import Actions from "@/components/utilities/actions";
import { useEffect } from "react";
import Navbar from "@/components/utilities/navbar";
import Player from "@/components/utilities/player";

// If loading a variable font, you don't need to specify the font weight
const mavenPro = Maven_Pro({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add("light");
    document.body.classList.add(mavenPro.className);
  });

  return (
    <div
      className={`wora-transition text-xs antialiased dark:bg-black dark:text-white`}
    >
      <Actions />
      <div className="select-none dark:bg-black bg-white dark:text-white">
        <div className="flex gap-8">
          <div className="sticky z-50 top-0 h-dvh p-8 pt-12 pr-0">
            <Navbar />
          </div>
          <div className="flex-grow p-8 pt-12 pl-0 h-screen">
            <div className="relative flex h-full w-full flex-col">
              <Component {...pageProps} />
              <Player />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
