const colors = {
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function Badge({ children, color = 'indigo', size = 'sm', className = '' }) {
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium
        ${size === 'sm' ? 'px-2.5 py-0.5 text-sm' : 'px-3.5 py-1 text-base'}
        ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}
