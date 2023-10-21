import React, { useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import useIsMobile from "~/hooks/utils/useIsMobile";
import Tabs from "~/components/landing-page/Tabs";
import Image from "next/image";

export const TitlePage = () => {
    const { isMobile } = useIsMobile();
    const { boot } = useIntercom();

    useEffect(() => { boot(); }, [boot]);

  return (
    <div className="landing-page-gradient-1 relative flex h-screen w-screen flex-col items-center font-calibri overflow-hidden">
      <div className="absolute right-4 top-4">
        <a href="https://www.sea.dev/" target="_blank">
          <button className="flex items-center justify-center font-nunito text-lg font-bold ">
            sea.dev
            <Image src="logo-black.svg" className="mx-2 rounded-lg" width={40} alt={"Your ad could be here"} />
          </button>
        </a>
      </div>
      <div className="pt-28 flex flex-col items-center landing-page-header-image max-w-[1200px] w-full">
        <div className="w-4/5 text-center text-4xl">
          {/* Improve the efficiency of your credit teams with{" "} */}
          {/* <span className="font-bold">Finance WorkFlow Agent </span> */}
          <span className="font-bold">WorkFlow Agent </span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="w-3/5 text-center font-nunito">
            {/* //small text */}
          </div>
        </div>
      </div>
      {isMobile ? (
        <div className="mt-12 flex h-1/5 w-11/12 rounded border p-4 text-center">
          <div className="text-xl font-bold">
            To start analyzing documents, please switch to a larger screen!
          </div>
        </div>
      ) : (
        <Tabs />
      )}
    </div>
  );
};
