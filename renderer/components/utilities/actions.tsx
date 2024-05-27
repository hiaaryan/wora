import { IconArrowDownRight, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "../ui/button";

function Actions() {
  const closeWindow = () => {
    window.ipc.send("closeApp", 1);
  };

  const minimizeWindow = () => {
    window.ipc.send("minimizeApp", 1);
  };

  return (
    <div className="z-50 w-full absolute top-0 flex items-center justify-end px-8 py-4 drag">
      <div className="flex w-full items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Image src={"/icon.ico"} alt="logo" width={16} height={16} />
          Wora v0.1.0-alpha
        </div>
        <div className="flex items-center gap-3 no-drag">
          <Button variant="ghost" onClick={minimizeWindow}>
            <IconArrowDownRight className="w-3.5" stroke={2} />
          </Button>
          <Button variant="ghost" onClick={closeWindow}>
            <IconX className="w-3.5" stroke={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Actions;
