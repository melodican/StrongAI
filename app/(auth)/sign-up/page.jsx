"use client";
import AuthFormTitleSection from "@/components/Common/AuthFormTitleSection";
import AuthRedirectSection from "@/components/Common/AuthRedirectionSection";
import CommonButton from "@/components/Common/CommonButton";
import CommonTextInput from "@/components/Common/CommonTextInput";
import ErrorMessage from "@/components/Common/ErrorMessage";
import PhoneInputField from "@/components/Common/PhoneInputField";
import {
  DEFAULT_ERROR_MESSAGE,
  EMAIL_VALIDATION_MESSAGE,
  EMAL_REGEX,
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from "@/constant";
import { useAuth } from "@/contexts/AuthContextProvider";
import { successType, toastMessages } from "@/helpers/toastMessage";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const page = () => {
  const router = useRouter();
  const formConfig = useForm();
  const { signUpNewUser } = useAuth();
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    clearErrors,
    setError,
  } = formConfig;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    console.log(data, "this is data");
    setIsLoading((prev) => true);
    try {
      const response = await signUpNewUser(data);
      if (response?.success) {
        toastMessages(
          "Account created successfully! Please check your email for a verification link.",
          successType
        );
        router.push("/sign-in");
      } else {
        console.log(response?.error?.message, "this is error");
        toastMessages(response?.error?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "err");
      toastMessages(error?.message || DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoading((prev) => false);
    }
  };

  const togglePass = (type) => {
    if (type === "password") {
      setShowPassword((prev) => !prev);
    } else {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const handleChangePassword = (value, type) => {
    const password = watch("password");
    const confirmPassword = watch("confirm_password");
    if (type === "password" && password?.length && confirmPassword?.length) {
      if (value === confirmPassword) {
        clearErrors("confirm_password");
      } else {
        setError("confirm_password", {
          type: "manual",
          message: "Password and confirm password must match",
        });
      }
    }
  };

  return (
    <div className="py-4">
      <div className="max-w-[584px] w-full min-h-[84vh] flex flex-col items-center justify-center mx-auto">
        <AuthFormTitleSection title={"Sign Up !"} />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-5 mt-4 rounded-none shadow-lg w-full"
        >
          <div className="grid grid-cols-2 gap-3">
            <CommonTextInput
              fieldName={"first_name"}
              formConfig={formConfig}
              type="text"
              placeholder={"E.g. John"}
              rules={{
                required: "First name is required",
              }}
              label={"First Name"}
            />

            <CommonTextInput
              fieldName={"last_name"}
              formConfig={formConfig}
              type="text"
              placeholder={"E.g. Doe"}
              rules={{
                required: "Last name is required",
              }}
              label={"Last Name"}
            />
          </div>

          <CommonTextInput
            fieldName={"email"}
            formConfig={formConfig}
            type="text"
            placeholder={"E.g. abc@gmail.com"}
            rules={{
              required: "Email is required",
              pattern: {
                value: EMAL_REGEX,
                message: EMAIL_VALIDATION_MESSAGE,
              },
            }}
            label={"Email"}
          />

          {/* <CommonTextInput
            fieldName="phone_no"
            formConfig={formConfig}
            isNumberOnly={true}
            placeholder="E.g. 9472727712"
            maxLength={10}
            rules={{
              required: "Phone number is required",
            }}
            label="Phone Number"
          /> */}

          <PhoneInputField formConfig={formConfig} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label">
                Password <span className="required">*</span>
              </div>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    pattern: {
                      value: PASSWORD_REGEX,
                      message: PASSWORD_MESSAGE,
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleChangePassword(e.target.value, "password");
                        }}
                        className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-sm transition-all"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                      />
                    </>
                  )}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-[17px] cursor-pointer"
                  onClick={() => togglePass("password")}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>
              <ErrorMessage fieldName="password" errors={errors} />
            </div>

            <div>
              <div className="label">
                Confirm Password <span className="required">*</span>
              </div>
              <div className="relative">
                <Controller
                  name="confirm_password"
                  control={control}
                  rules={{
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === watch("password") ||
                      "Password and confirm password must match",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleChangePassword(
                            e.target.value,
                            "confirm_password"
                          );
                        }}
                        className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-sm transition-all"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                      />
                    </>
                  )}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-[17px] cursor-pointer"
                  onClick={() => togglePass("confirm_password")}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>
              <ErrorMessage fieldName="confirm_password" errors={errors} />
            </div>
          </div>

          <CommonButton
            type="submit"
            className="auth-button"
            disabled={isLoading}
            loader={isLoading}
            text={isLoading ? "Signing up" : "Sign Up"}
          />

          <div className="h-[70px] md:h-[20px]"></div>

          <AuthRedirectSection
            text="Already have an account? "
            linkText="Log in"
            linkUrl={"/sign-in"}
            className="primary-text-color text-[14px] text-center"
          />
        </form>
      </div>
    </div>
  );
};

export default page;
