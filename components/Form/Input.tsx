import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import * as Form from "../Form";

interface InputProps extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({ label, value, onChange, ...props }) => {
  return (
    <Form.Group>
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      <div className="mt-1">
        <input className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={value} onChange={e => onChange(e.target.value)} {...props} />
      </div>
    </Form.Group>
  );
};
