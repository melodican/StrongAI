"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toastMessages } from "@/helpers/toastMessage";
import {
  DEFAULT_ERROR_MESSAGE,
  EMAIL_VALIDATION_MESSAGE,
  EMAL_REGEX,
} from "@/constant";
import supabase from "@/lib/supabase";
import AuthRedirectSection from "@/components/Common/AuthRedirectionSection";
import CommonTextInput from "@/components/Common/CommonTextInput";
import CommonButton from "@/components/Common/CommonButton";
import AuthFormTitleSection from "@/components/Common/AuthFormTitleSection";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useChat } from "@/contexts/ChatContextProvider";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const formConfig = useForm();
  const { handleSubmit } = formConfig;
  const { setMessages } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setIsLoading((prev) => true);

    try {
      const response = await signIn(data);
      if (response?.success) {
        window.location.href = "/chat";
        // router.push("/chat");
        console.log(response, "this is response");
      } else {
        toastMessages(response?.error?.message || DEFAULT_ERROR_MESSAGE);
      }
    } catch (error) {
      console.log(error, "err");
      toastMessages(error?.message || DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoading((prev) => false);
    }
  };

  return (
    <div className="max-w-[584px] w-full min-h-[84vh] flex flex-col items-center justify-center mx-auto">
      <AuthFormTitleSection title={"Login !"} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-5 mt-4 rounded-none shadow-lg w-full"
      >
        <CommonTextInput
          fieldName={"email"}
          formConfig={formConfig}
          type="text"
          placeholder="Enter Email"
          rules={{
            required: "Email is required",
            pattern: {
              value: EMAL_REGEX,
              message: EMAIL_VALIDATION_MESSAGE,
            },
          }}
          label="Username or email address"
        />

        <CommonTextInput
          fieldName="password"
          formConfig={formConfig}
          placeholder="Enter Password"
          rules={{
            required: "Password is required",
          }}
          label="Your password"
          type={showPassword ? "text" : "password"}
          onIconClick={toggleShowPassword}
          icon={showPassword ? <EyeOff /> : <Eye />}
        />
        <div className="text-[16px] font-normal ml-1 flex justify-between items-baseline">
          {/* commented for future use */}
          {/* <div className="text-[16px] font-normal ml-1 sm:flex-col">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              onChange={(e) => handleRememberMe(e)}
              id="flexCheckDefault"
              checked={rememberMe}
            />
            <label
              className="text-[16px] font-normal ml-1"
              htmlFor="flexCheckDefault"
            >
              Remember Me
            </label>
          </div> */}
          {/* <AuthRedirectSection
            text=""
            linkText="Forgot your password ?"
            // update required (Add forget password route here)
            linkUrl={"/"}
            className="text-right primary-text-color text-[16px] font-normal"
          /> */}
        </div>
        <CommonButton
          type="submit"
          className="auth-button"
          disabled={isLoading}
          loader={isLoading}
          text={isLoading ? "Signing in..." : "Sign In"}
        />

        <div className="h-[70px] md:h-[20px]"></div>

        <AuthRedirectSection
          text="Don't have an account? "
          linkText="Sign up"
          linkUrl={"/sign-up"}
          className="primary-text-color text-[14px] text-center"
        />
      </form>
    </div>
  );
}
