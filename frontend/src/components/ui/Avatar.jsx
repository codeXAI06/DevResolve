export default function Avatar({ username, avatarUrl, size = 'md', className = '' }) {
  const dims = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg' };
  const initials = username ? username.slice(0, 2).toUpperCase() : '??';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`rounded-full object-cover ${dims[size]} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white ${dims[size]} ${className}`}>
      {initials}
    </div>
  );
}
