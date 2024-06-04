import { Maven_Pro } from "next/font/google";
import "../styles/globals.css";
import Actions from "@/components/utilities/actions";
import { useEffect } from "react";
import Navbar from "@/components/utilities/navbar";
import Player from "@/components/utilities/player";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";

const mavenPro = Maven_Pro({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.remove("dark");
    document.body.classList.add(mavenPro.className);
  }, []);

  const router = useRouter();
  const noLayoutPages = ["/tray", "/setup"];
  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {isNoLayoutPage ? (
        <Component {...pageProps} />
      ) : (
        <div className="wora-transition text-xs antialiased dark:bg-black/10 dark:text-white">
          <Actions />
          <div className="select-none bg-white dark:bg-black dark:text-white">
            <div className="flex gap-8">
              <div className="sticky top-0 z-50 h-dvh p-8 pr-0 pt-12">
                <Navbar />
              </div>
              <div className="h-screen flex-grow p-8 pl-0 pt-12">
                <div className="relative flex h-full w-full flex-col">
                  <Component {...pageProps} />
                  <Player />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
