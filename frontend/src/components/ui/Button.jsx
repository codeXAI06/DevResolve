import React from 'react';

const base =
  'inline-flex items-center justify-center whitespace-nowrap font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 focus:ring-gray-600',
  outline: 'border border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 text-gray-200 focus:ring-indigo-500',
};

const sizes = {
  sm: 'text-sm px-5 py-2 gap-2 min-w-[80px]',
  md: 'text-base px-6 py-2.5 gap-2 min-w-[100px]',
  lg: 'text-lg px-8 py-3 gap-2.5 min-w-[120px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
