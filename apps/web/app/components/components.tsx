"use client";
import { PasswordInput } from "./password-input";
import { Toggle } from "@/app/components/toggle";

const Components = () => {
  return (
    <div className=" p-5">
      <div className=" border border-gray-500/50 rounded-sm p-10">
        <p>password input:</p>
        <PasswordInput />
      </div>

      <div className=" border border-gray-500/50 rounded-sm p-10">
        <p>toggle</p>
        <Toggle />
      </div>
    </div>
  );
};

export { Components };
