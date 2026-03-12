import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function AnswerCard({ answer, isAuthor, onAccept }) {

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={`bg-gray-900 border rounded-2xl p-6 ${answer.accepted ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <Avatar username={answer.author?.username} size="sm" />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-medium text-gray-200">{answer.author?.username}</span>
              {answer.accepted && (
                <Badge color="green" size="sm"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>
              )}
            </div>
            <span className="text-sm text-gray-500">{timeAgo(answer.createdAt)}</span>
          </div>
        </div>

        {isAuthor && !answer.accepted && (
          <Button variant="outline" size="sm" onClick={() => onAccept?.(answer.id)}>
            <CheckCircle2 className="h-4 w-4" /> Accept
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="markdown-body text-gray-300 mb-5">
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
          {answer.content}
        </ReactMarkdown>
      </div>

      {/* Code snippet if separate */}
      {answer.codeSnippet && (
        <div className="mb-5">
          <SyntaxHighlighter style={oneDark} language="javascript" customStyle={{ borderRadius: '0.5rem', border: '1px solid #334155' }}>
            {answer.codeSnippet}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
