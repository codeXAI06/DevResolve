export default function Card({ children, className = '', hover = false, ...rest }) {
  return (
    <div
      className={`bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-md
        ${hover ? 'hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer' : ''} 
        ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
