import { Link } from 'react-router-dom';
import { MessageSquare, Eye, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const statusColors = { OPEN: 'green', ANSWERED: 'blue', CLOSED: 'gray' };

export default function DoubtCard({ doubt }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <Link to={`/doubts/${doubt.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/10 relative overflow-hidden">
        {/* Optional glowing effect on top edge on hover */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-start gap-6">
          {/* Stats */}
          <div className="hidden sm:flex flex-col items-center gap-4 text-center min-w-[72px] shrink-0 pt-1">
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl w-full border ${doubt.status === 'ANSWERED' || doubt.acceptedAnswerId ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-gray-800/50 border-gray-700/50 text-gray-300'}`}>
              <span className="text-2xl font-bold">{doubt.answerCount || 0}</span>
              <span className="text-xs font-medium uppercase tracking-wider mt-0.5">answers</span>
            </div>
            <div className="flex flex-col items-center text-gray-500">
              <Eye className="h-5 w-5 mb-1 opacity-70" />
              <span className="text-sm font-semibold">{doubt.viewCount || 0} views</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2.5">
              <Badge color={statusColors[doubt.status] || 'gray'} size="sm" className="font-semibold tracking-wide">
                {doubt.status === 'ANSWERED' && <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                {doubt.status}
              </Badge>
              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                <Clock className="h-4 w-4 opactiy-70" />
                {timeAgo(doubt.createdAt)}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-100 mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors leading-snug">
              {doubt.title}
            </h3>

            <p className="text-base text-gray-400 mb-4 line-clamp-2 leading-relaxed">
              {doubt.description?.replace(/[#*`]/g, '').slice(0, 160)}...
            </p>

            {/* Tags area */}
            <div className="flex items-center justify-between mt-auto pt-2">
              {doubt.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doubt.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} color="indigo" size="sm" className="bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 transition-colors">{tag}</Badge>
                  ))}
                  {doubt.tags.length > 4 && (
                    <span className="text-xs text-gray-500 self-center font-medium">+{doubt.tags.length - 4} more</span>
                  )}
                </div>
              ) : <div />}

              {/* Author */}
              <div className="flex items-center gap-2.5 bg-gray-800/50 rounded-full py-1 pl-1 pr-3 shrink-0">
                <Avatar username={doubt.author?.username} size="sm" />
                <span className="text-sm font-medium text-gray-300">{doubt.author?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
