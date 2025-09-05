import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-semibold text-gray-600"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`mt-1 block w-full h-10 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 backdrop-blur-sm px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60 transition-colors sm:text-sm md:text-base ${className || ""}`}
      />
    </div>
  );
};

export default Input;
