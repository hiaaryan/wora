import React from "react";
import Actions from "@/components/utilities/actions";

export default function HomePage() {
  return (
    <div className="wora-transition h-screen w-screen bg-white text-xs antialiased dark:bg-black dark:text-white">
      <Actions />
      <div className="select-none dark:text-white"></div>
    </div>
  );
}
