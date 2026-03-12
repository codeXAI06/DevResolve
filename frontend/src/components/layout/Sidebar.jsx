import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, TrendingUp, Trophy, Users, Tag } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/doubts', icon: MessageCircle, label: 'All Doubts' },
  { to: '/tags', icon: Tag, label: 'Tags' },
  { to: '/leaderboard', icon: TrendingUp, label: 'Leaderboard' },
  { to: '/rewards', icon: Trophy, label: 'Rewards' },
  { to: '/collab', icon: Users, label: 'Collab Rooms' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <nav className="sticky top-24 flex flex-col gap-2.5 py-6">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3.5 w-full px-5 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200
              ${isActive
                ? 'bg-indigo-500/15 text-indigo-400 border-l-[3px] border-indigo-500'
                : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-200'}`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
