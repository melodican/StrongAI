import { LOGO_TITLE } from "@/constant";
import Image from "next/image";
import React from "react";

const AuthFormTitleSection = ({ title }) => {
  return (
    <div>
      <div className="flex justify-center ">
        <Image src={"/images/logo.png"} width={100} height={100} alt="logo" />
      </div>
      <div className="md:text-[14px]">
        <h2 className="text-center text-[24px] font-bold mt-2">{title}</h2>
      </div>
    </div>
  );
};

export default AuthFormTitleSection;
