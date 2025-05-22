import React from "react";

const ErrorMessage = ({ fieldName, errors, customError = "" }) => {
  return (
    <>
      {customError ? (
        <p className="mt-1 text-sm text-red-500">{customError}</p>
      ) : (
        errors?.[fieldName] && (
          <p className="mt-1 text-xs text-red-500">
            {errors?.[fieldName].message}
          </p>
        )
      )}
    </>
  );
};

export default ErrorMessage;
