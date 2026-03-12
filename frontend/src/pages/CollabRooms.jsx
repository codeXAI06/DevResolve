import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collabApi } from '../api/misc';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Users, Plus, LogIn, X, Code2, ChevronDown, Link2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql',
  'shell', 'dart', 'scala', 'r',
];

export default function CollabRooms() {
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [joinId, setJoinId] = useState('');
  const [myRooms, setMyRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadMyRooms();
    } else {
      setLoadingRooms(false);
    }
  }, [token]);

  const loadMyRooms = async () => {
    try {
      const { data } = await collabApi.getMyRooms();
      setMyRooms(data || []);
    } catch {
      // ignore
    } finally {
      setLoadingRooms(false);
    }
  };

  const createRoom = async () => {
    setCreating(true);
    try {
      const { data } = await collabApi.createRoom({ language: selectedLang });
      toast.success('Room created! Share the room ID with others to collaborate.');
      setShowCreateModal(false);
      navigate(`/collab/${data.id}`);
    } catch (err) {
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = () => {
    const trimmed = joinId.trim();
    if (!trimmed) {
      toast.error('Enter a room ID to join');
      return;
    }
    navigate(`/collab/${trimmed}`);
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto py-10 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <Users className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Collab Rooms</h1>
          <p className="text-gray-400 text-lg">Real-time collaborative code editing. Create a room or join one with a shared ID.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Create Room Card */}
          <Card className="flex flex-col items-center text-center p-8 cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300" onClick={() => setShowCreateModal(true)}>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Create a Room</h3>
            <p className="text-sm text-gray-400">Start a new collaborative coding session and invite others with the room ID.</p>
          </Card>

          {/* Join Room Card */}
          <Card className="flex flex-col items-center text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Join a Room</h3>
            <p className="text-sm text-gray-400 mb-4">Enter a room ID shared by a collaborator.</p>
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                placeholder="Paste room ID..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              <Button size="sm" variant="outline" onClick={joinRoom} icon={<LogIn className="h-4 w-4" />}>
                Join
              </Button>
            </div>
          </Card>
        </div>

        {/* My Rooms Section */}
        {token && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              My Rooms
            </h2>
            {loadingRooms ? (
              <Spinner className="py-10" />
            ) : myRooms.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-gray-500">No rooms yet. Create or join a room to get started!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRooms.map((room) => (
                  <Link key={room.id} to={`/collab/${room.id}`}>
                    <Card hover className="p-5 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                          {room.language || 'javascript'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${room.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                          {room.active ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-white mb-1">Room {room.id?.slice(0, 8)}...</h3>
                      <p className="text-xs text-gray-500">Created by {room.createdBy?.username || 'Unknown'}</p>
                      {room.createdAt && (
                        <p className="text-xs text-gray-600 mt-1">{new Date(room.createdAt).toLocaleDateString()}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-400" /> Create Collab Room
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2.5">Programming Language</label>
              <div className="relative">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-3.5 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createRoom} loading={creating} icon={<Plus className="h-4 w-4" />} size="sm">
                Create Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
