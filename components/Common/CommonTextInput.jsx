"use client";
import React from "react";
import ErrorMessage from "./ErrorMessage";

const DEFAULT_CLASS =
  "px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-sm transition-all";

const CommonTextInput = ({
  rules,
  fieldName,
  formConfig,
  type = "text",
  disabled = false,
  placeholder,
  className = DEFAULT_CLASS,
  label,
  icon,
  onIconClick,
  isNumberOnly = false,
  maxLength = null,
  showAsterisk = true,
  rows = null,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = formConfig;
  return (
    <div>
      <div className="label">
        {label} {showAsterisk ? <span className="required"> *</span> : ""}
      </div>
      <div className="relative">
        {isNumberOnly ? (
          <input
            {...register(fieldName, {
              ...rules,
              onChange: (e) => {
                const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                setValue(fieldName, numbersOnly);
              },
            })}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={
              disabled
                ? `${className} mb-2  cursor-not-allowed`
                : `${className} mb-2`
            }
            maxLength={maxLength}
          />
        ) : type === "textarea" ? (
          <textarea
            {...register(fieldName, rules)}
            type={type}
            placeholder={placeholder}
            className={className}
            maxLength={maxLength}
            rows={rows}
          />
        ) : (
          <input
            {...register(fieldName, rules)}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={
              disabled
                ? `${className} mb-2  cursor-not-allowed`
                : `${className} mb-2`
            }
            maxLength={maxLength}
          />
        )}

        <div
          className="absolute bottom-[22px] right-[17px] cursor-pointer"
          onClick={onIconClick}
        >
          {icon}
        </div>
      </div>
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </div>
  );
};

export default CommonTextInput;
