"use client";
import supabase from "@/lib/supabase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const router = useRouter();
  const [session, setSession] = useState(undefined);

  const setCookie = (name, value, days) => {
    Cookies.set(name, value, { expires: days, path: "/" });
  };

  const clearAllCookies = () => {
    Object.keys(Cookies.get()).forEach((cookie) =>
      Cookies.remove(cookie, { path: "/" })
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
      if (data?.session?.access_token) {
        setCookie("sb-access-token", data.session.access_token, 7);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.access_token) {
        setCookie("sb-access-token", session.access_token, 7);
      } else {
        clearAllCookies();
        localStorage.clear();
        router.push("/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpNewUser = async (payload) => {
    try {
      const { email, password, phone, first_name, last_name } = payload;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          redirectTo: "http://44.215.99.26/sign-in",
          data: {
            phone,
            first_name,
            last_name,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };

  const signIn = async (payload) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(payload);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearAllCookies();
      localStorage.clear();
      setSession(null);
      router.push("/sign-in");
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, signUpNewUser, signIn, signOut, setSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContextProvider;
