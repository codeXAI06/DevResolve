import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, Clock } from 'lucide-react';
import { doubtsApi } from '../api/doubts';
import { answersApi } from '../api/answers';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import AnswerCard from '../components/answer/AnswerCard';
import AnswerForm from '../components/answer/AnswerForm';
import toast from 'react-hot-toast';

export default function DoubtDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [doubt, setDoubt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDoubt();
    loadAnswers();
  }, [id]);

  const loadDoubt = async () => {
    try {
      const { data } = await doubtsApi.getById(id);
      setDoubt(data);
    } catch {
      toast.error('Doubt not found');
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const { data } = await answersApi.getByDoubt(id);
      setAnswers(data.content || data || []);
    } catch {
      console.error('Failed to load answers');
    }
  };

  const handlePostAnswer = async (formData) => {
    setSubmitting(true);
    try {
      await answersApi.create(id, formData);
      toast.success('Answer posted!');
      loadAnswers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (answerId) => {
    try {
      await answersApi.accept(answerId);
      toast.success('Answer accepted!');
      loadDoubt();
      loadAnswers();
    } catch (err) {
      toast.error('Failed to accept answer');
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statusColors = { OPEN: 'green', ANSWERED: 'blue', CLOSED: 'gray' };
  const isAuthor = user?.id === doubt?.author?.id;

  if (loading) return <PageLayout><Spinner className="py-20" /></PageLayout>;
  if (!doubt) return <PageLayout><p className="text-center text-gray-400 py-20">Doubt not found.</p></PageLayout>;

  return (
    <PageLayout>
      <div className="animate-fade-in max-w-5xl mx-auto">
        {/* Doubt Header */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 shadow-xl rounded-3xl p-8 sm:p-10 mb-10 relative overflow-hidden">
          {/* subtle glow behind */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
            <Badge color={statusColors[doubt.status]} size="md" className="shadow-sm">{doubt.status}</Badge>
            {doubt.tags?.map((tag) => (
              <Badge key={tag} color="indigo" size="sm" className="bg-indigo-500/10 border-indigo-500/20">{tag}</Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight relative z-10">{doubt.title}</h1>

          <div className="markdown-body text-gray-300 mb-8 relative z-10 text-lg leading-relaxed">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
              }}
            >
              {doubt.description}
            </ReactMarkdown>
          </div>

          {doubt.codeSnippet && (
            <div className="mb-4">
              <SyntaxHighlighter style={oneDark} language="javascript" customStyle={{ borderRadius: '0.5rem', border: '1px solid #334155' }}>
                {doubt.codeSnippet}
              </SyntaxHighlighter>
            </div>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar username={doubt.author?.username} size="md" />
              <div>
                <span className="text-base font-medium text-gray-200">{doubt.author?.username}</span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{timeAgo(doubt.createdAt)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{doubt.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-5">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
          <div className="space-y-5">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isAuthor={isAuthor}
                onAccept={handleAccept}
              />
            ))}
          </div>
        </div>

        {/* Post Answer */}
        {isAuthenticated && doubt.status !== 'CLOSED' && (
          <AnswerForm onSubmit={handlePostAnswer} loading={submitting} />
        )}
      </div>
    </PageLayout>
  );
}
