import { Maven_Pro } from "next/font/google";
import "../styles/globals.css";
import Actions from "@/components/utilities/actions";
import { useEffect } from "react";
import Navbar from "@/components/utilities/navbar";
import Player from "@/components/utilities/player";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import { PlayerProvider } from "@/context/playerContext";

const mavenPro = Maven_Pro({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noLayoutPages = ["/setup"];
  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  useEffect(() => {
    document.body.classList.add(mavenPro.className);

    window.ipc.invoke("get-settings").then((response) => {
      if (!response) {
        router.push("/setup");
      }
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Wora</title>
      </Head>
      <PlayerProvider>
        <div className="h-screen w-screen bg-black text-xs text-white antialiased">
          {isNoLayoutPage ? (
            <Component {...pageProps} />
          ) : (
            <div>
              <Actions />
              <div className="flex gap-8">
                <div className="sticky top-0 z-50 h-dvh p-8 pr-0 pt-12">
                  <Navbar />
                </div>
                <div className="h-screen flex-grow p-8 pl-0 pt-10">
                  <div className="wora-transition relative flex h-full w-full flex-col">
                    <Component {...pageProps} />
                    <Player />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PlayerProvider>
    </div>
  );
}
