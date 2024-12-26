import "@/styles/globals.css";
import Actions from "@/components/ui/actions";
import Navbar from "@/components/main/navbar";
import Player from "@/components/main/player";
import { PlayerProvider } from "@/context/playerContext";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/themeProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <main className="select-none antialiased bg-white dark:bg-black text-black dark:text-white text-xs">
        {["/setup"].includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <PlayerProvider>
            <div className="h-dvh w-dvw">
              <Actions />
              <Toaster position="top-right" />
              <div className="flex gap-8">
                <div className="sticky top-0 z-50 h-dvh p-8 pr-0 pt-12">
                  <Navbar />
                </div>
                <div className="h-dvh flex-grow p-8 pl-0 pt-12">
                  <div className="wora-transition relative flex h-full w-full flex-col">
                    <ScrollArea className="h-full w-full gradient-mask-b-70-d">
                      <Component {...pageProps} />
                      <div className="h-[20vh] w-full"></div>
                    </ScrollArea>
                    <Player />
                  </div>
                </div>
              </div>
            </div>
          </PlayerProvider>
        )}
      </main>
    </ThemeProvider>
  );
}
