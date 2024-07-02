import Image from "next/image";

function Actions() {
  return (
    <div className="drag absolute top-0 z-50 flex h-11 w-full items-center justify-end px-8 py-2.5">
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-full items-center gap-2">
          <Image
            src={"/assets/Logo [Dark].ico"}
            alt="logo"
            width={16}
            height={16}
          />
          Wora v0.1.0
        </div>
      </div>
    </div>
  );
}

export default Actions;
