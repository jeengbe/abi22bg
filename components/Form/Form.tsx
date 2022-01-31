import { FormEvent } from "react";

interface FormProps {
  onSubmit: (e?: FormEvent<HTMLFormElement>) => void;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, ...props }) => {
  return (
    <form
      className="space-y-6"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(e);
      }}
      {...props}
    >
      {children}
    </form>
  );
};
