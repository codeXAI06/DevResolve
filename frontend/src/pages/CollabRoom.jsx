import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Editor from '@monaco-editor/react';
import { collabApi } from '../api/misc';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Copy, Save, Download, ArrowLeft, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FILE_EXTENSIONS = {
  javascript: 'js', typescript: 'ts', python: 'py', java: 'java', cpp: 'cpp',
  c: 'c', csharp: 'cs', go: 'go', rust: 'rs', ruby: 'rb', php: 'php',
  swift: 'swift', kotlin: 'kt', html: 'html', css: 'css', sql: 'sql',
  shell: 'sh', dart: 'dart', scala: 'scala', r: 'r',
};

export default function CollabRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const clientRef = useRef(null);
  const localChange = useRef(false);

  useEffect(() => {
    loadRoom();
    return () => {
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, [id]);

  const loadRoom = async () => {
    try {
      const { data } = await collabApi.getRoom(id);
      setRoom(data);
      setCode(data.codeContent || '');
      connectWs(data.id);
      // Auto-join as participant
      if (token) {
        collabApi.joinRoom(data.id).catch(() => {});
      }
    } catch {
      toast.error('Room not found');
    } finally {
      setLoading(false);
    }
  };

  const connectWs = (roomId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/collab/${roomId}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.username !== user?.username) {
            localChange.current = true;
            setCode(data.code);
          }
        });
      },
      onStompError: () => toast.error('WebSocket connection failed'),
    });
    client.activate();
    clientRef.current = client;
  };

  const handleCodeChange = (value) => {
    if (localChange.current) {
      localChange.current = false;
      return;
    }
    setCode(value);
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/collab/${room.id}/code`,
        body: JSON.stringify({ code: value, username: user?.username }),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await collabApi.saveCode(room.id, code);
      toast.success('Code saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const ext = FILE_EXTENSIONS[room.language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collab-${room.id.slice(0, 8)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      toast.success('Room ID copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [room]);

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await collabApi.closeRoom(room.id);
      toast.success('Room deleted!');
      navigate('/collab');
    } catch {
      toast.error('Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user?.username === room?.createdBy?.username;

  if (loading) return <PageLayout sidebar={false}><Spinner className="py-20" /></PageLayout>;
  if (!room) return <PageLayout sidebar={false}><p className="text-gray-400 text-center py-20">Room not found.</p></PageLayout>;

  return (
    <PageLayout sidebar={false}>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => navigate('/collab')} className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">Collab Room</h1>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-sm text-gray-500">Language:</span>
              <span className="text-sm text-indigo-400 font-medium">{room.language || 'javascript'}</span>
              <span className="text-gray-700">|</span>
              <span className="text-sm text-gray-500">ID:</span>
              <code className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-mono">{room.id.slice(0, 8)}...</code>
              <button
                onClick={copyRoomId}
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                title="Copy full room ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSave} loading={saving} icon={<Save className="h-4 w-4" />}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
              Download
            </Button>
            {isOwner && (
              <Button size="sm" variant="danger" onClick={handleDeleteRoom} loading={deleting} icon={<Trash2 className="h-4 w-4" />}>
                Delete
              </Button>
            )}
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <Editor
            height="70vh"
            language={room.language || 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              wordWrap: 'on',
            }}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
