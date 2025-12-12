import React, { useState, FC } from "react";

interface PasswordInputProps {
  placeholder?: string;
  errors?: { message: string };
  register?: any; //UseFormRegister<StationParkedFeeForm>;
  registerName?: string;
}

export const PasswordInput: FC<PasswordInputProps> = ({
  placeholder,
  errors,
  register,
  registerName,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className=" relative bg-red-50">
      <input
        name="password"
        placeholder={placeholder}
        {...(registerName && register ? register(registerName) : {})}
        className=" bg-white border border-black px-2 py-1 w-full"
        type={showPassword ? "text" : "password"}
      />

      <div
        onClick={() => {
          setShowPassword(!showPassword);
        }}
        className="absolute right-2 top-1.5 cursor-pointer flex z-10"
      >
        👁️
        {!showPassword && (
          <span className=" h-px inline-block bg-black/80 w-full absolute top-1/2 rotate-45"></span>
        )}
      </div>

      {errors && (
        <p className="text-red-500 text-xs absolute ">{errors.message}</p>
      )}
    </div>
  );
};
