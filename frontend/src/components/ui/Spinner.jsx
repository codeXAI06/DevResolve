export default function Spinner({ size = 'md', className = '' }) {
  const dims = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin text-indigo-500 ${dims[size]}`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );
}
