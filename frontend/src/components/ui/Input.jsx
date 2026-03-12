import React from 'react';

export default function Input({ label, error, icon, className = '', id, ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{icon}</div>
        )}
        <input
          id={inputId}
          className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-3.5 text-base text-gray-100 placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
            ${icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
