import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-background">
      <div className="w-full flex flex-col items-center">
        <div className="w-full px-5">{children}</div>
        <div className="max-w-[800px] mx-auto relative">
          <div className="container">
            <div className="login-copyright">
              <div>
                <p className="text-xs text-gray-600 mb-3 mb-0 font-normal">
                  © copyright 2025 Strong AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
