import { Maven_Pro } from "next/font/google";
import "../styles/globals.css";
import Actions from "@/components/utilities/actions";
import { useEffect } from "react";
import Navbar from "@/components/utilities/navbar";
import Player from "@/components/utilities/player";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import Head from "next/head";

const mavenPro = Maven_Pro({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add(mavenPro.className);
    window.ipc.invoke("get-settings").then((response) => {
      if (response[0]) {
        console.log(true);
      }
    });
  }, []);

  const router = useRouter();
  const noLayoutPages = ["/tray", "/setup"];
  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head>
        <title>Home</title>
      </Head>
      {isNoLayoutPage ? (
        <Component {...pageProps} />
      ) : (
        <div className="wora-transition bg-white text-xs antialiased dark:bg-black dark:text-white">
          <Actions />
          <div className="select-none dark:text-white">
            <div className="flex gap-8">
              <div className="sticky top-0 z-50 h-dvh p-8 pr-0 pt-12">
                <Navbar />
              </div>
              <div className="h-screen flex-grow p-8 pl-0 pt-12">
                <div className="relative flex h-full w-full flex-col">
                  <Component {...pageProps} />
                  <Player
                    file={
                      "/Users/hiaaryan/Documents/FLACs/Rockstar/12 Tum Ho.flac"
                    }
                    autoPlay={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
