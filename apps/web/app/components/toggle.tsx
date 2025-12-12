import React, { FC, useState, useEffect, InputHTMLAttributes } from "react";

interface ToggleProps {
  classname?: string;
  defaultValue?: boolean;
  register?: any;
  registerName?: string;
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (checked: boolean) => void;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // custom properties
  ref?: React.Ref<HTMLInputElement>;
}

const Toggle: FC<ToggleProps> = ({
  classname = "",
  //   defaultValue = false,
  register,
  registerName,
  checked,
  disabled = false,
  id,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(
    checked !== undefined ? checked : false
  );

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    console.log("newChecked: ", newChecked);
    if (checked === undefined) {
      setIsChecked(newChecked);
    }
    // notify parent component
    if (onChange) {
      onChange(newChecked);
    }
  };

  // input properties
  const inputProps: InputProps = {
    type: "checkbox",
    className:
      "custom_switch peer absolute top-0 z-10 h-full w-full cursor-pointer opacity-0 ",
    disabled,
    id,
  };

  // if provided register from react-hook-form
  if (register && registerName) {
    const registration = register(registerName);

    // combine register's onChange with our own onChange
    const originalOnChange = registration.onChange;

    inputProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // first execute the original onChange
      if (originalOnChange) {
        originalOnChange(e);
      }
      // second execute our own onChange
      handleChange(e);
    };

    // add other register properties
    inputProps.name = registration.name;
    inputProps.onBlur = registration.onBlur;
    inputProps.ref = registration.ref;
  } else {
    // if not provided register
    inputProps.checked = isChecked;
    // remove checked if not controlled
    inputProps.defaultChecked = undefined;
    inputProps.onChange = handleChange;
  }

  // if not used register but provided defaultValue
  if (!register && checked === undefined) {
    // inputProps.defaultChecked = defaultValue;
    delete inputProps.checked;
    // under not used register but provided defaultValue delete checked key
  }

  return (
    <div className={classname}>
      <div className="mx-auto max-w-[320px] dark:text-white-dark md:max-w-[1140px]">
        <div className="flex space-x-4 text-center text-base font-semibold rtl:space-x-reverse">
          <label className="relative h-6 w-12">
            <input {...(inputProps || {})} />
            <span
              className={` bg-icon block h-full rounded-full border-2 border-[#ebedf2] before:absolute  before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-[#ebedf2] before:bg-center before:bg-no-repeat before:left--2 before:transition-all before:duration-300 peer-checked:border-blue-500 peer-checked:before:bg-blue-500 peer-checked:before:left-2 dark:border-white-dark left-10 dark:before:bg-white-dark  ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            ></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export { Toggle };
