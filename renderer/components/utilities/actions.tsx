import { IconArrowDownRight, IconX } from "@tabler/icons-react";
import Image from "next/image";

function Actions() {
  // useEffect(() => {
  //   const closeWindow = () => {
  //     window.ipc.send("window-all-closed", "");
  //   };
  // });

  return (
    <div className="z-50 w-full absolute top-0 flex items-center justify-end px-8 py-4 drag">
      <div className="flex w-full items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Image src={"/icon.ico"} alt="logo" width={16} height={16} />
          Wora v0.1.0-alpha
        </div>
        <div className="flex items-center gap-3 no-drag">
          <IconArrowDownRight
            className="w-3.5 hover:opacity-75 wora-transition cursor-pointer"
            stroke={2}
          />
          <IconX
            className="w-3.5 hover:opacity-75 wora-transition cursor-pointer"
            stroke={2}
          />
        </div>
      </div>
    </div>
  );
}

export default Actions;
