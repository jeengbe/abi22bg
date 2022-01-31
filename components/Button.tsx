import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: "primary";
}

export const Button: React.FC<ButtonProps> = ({ variant, children, ...props }) => {
  const variantStyles = variant
    ? {
        primary: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
      }[variant]
    : "";

  const disabledStyles = props.disabled ? "opacity-70 pointer-events-none" : "";

  return (
    <button className={classNames(variantStyles, disabledStyles)} {...props}>
      {children}
    </button>
  );
};
