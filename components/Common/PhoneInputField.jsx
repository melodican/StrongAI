// components/PhoneNumberInput.jsx or .tsx
"use client";
import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Controller } from "react-hook-form";
import { isValidPhoneNumber } from "libphonenumber-js";
const DEFAULT_CLASS =
  "px-4 py-3 bg-gray-100 w-full text-sm input-outline-none rounded-sm transition-all";

const PhoneInputField = ({
  formConfig,
  fieldName = "phone",
  className = DEFAULT_CLASS,
  label = "Phone Number",
}) => {
  const {
    control,
    formState: { errors },
  } = formConfig;

  return (
    <div className="mb-4">
      <label className="label">
        {label} <span className="required"> *</span>
      </label>
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Phone number is required",
          validate: (value) =>
            isValidPhoneNumber(value || "") || "Enter a valid phone number",
        }}
        render={({ field }) => (
          <PhoneInput
            {...field}
            defaultCountry="IN"
            className={className}
            international
            countryCallingCodeEditable={false}
            placeholder="Enter phone number"
          />
        )}
      />
      {errors[fieldName] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[fieldName]?.message}
        </p>
      )}
    </div>
  );
};

export default PhoneInputField;
