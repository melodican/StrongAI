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
                <h4 className="text-base font-normal">
                  © copyright 2025 Strong AI
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
