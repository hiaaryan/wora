import { Maven_Pro } from "next/font/google";
import "../styles/globals.css";
import Actions from "@/components/utilities/actions";
import { useEffect } from "react";

// If loading a variable font, you don't need to specify the font weight
const mavenPro = Maven_Pro({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add("d");
  });

  return (
    <div>
      <div
        className={`${mavenPro.className} wora-transition text-xs antialiased dark:bg-black dark:text-white`}
      >
        <Actions />
        <Component {...pageProps} />
      </div>
    </div>
  );
}
