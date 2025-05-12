"use client";
import supabase from "@/lib/supabase";
import Cookies from "js-cookie";

import React, { createContext, useContext, useEffect, useState } from "react";
const SidebarContext = createContext();

const SidebarContextProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
        {children}
      </SidebarContext.Provider>
    </div>
  );
};
export const useSidebar = () => {
  return useContext(SidebarContext);
};

export default SidebarContextProvider;
