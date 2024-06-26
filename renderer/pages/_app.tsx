import "../styles/globals.css";
import Actions from "@/components/ui/actions";
import Navbar from "@/components/ui/navbar";
import Player from "@/components/ui/player";
import Head from "next/head";
import { PlayerProvider } from "@/context/playerContext";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  if (["/setup"].includes(router.pathname)) {
    return (
      <main className="select-none bg-black font-sans text-xs text-white antialiased">
        <Component {...pageProps} />
      </main>
    );
  }

  return (
    <main className="select-none bg-black font-sans text-xs text-white antialiased">
      <Head>
        <title>Wora</title>
      </Head>
      <PlayerProvider>
        <div className="h-dvh w-dvw">
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
        </div>
      </PlayerProvider>
    </main>
  );
}
