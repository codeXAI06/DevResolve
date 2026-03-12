import { useState } from 'react';
import Button from '../ui/Button';

export default function AnswerForm({ onSubmit, loading }) {
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content, codeSnippet: codeSnippet || undefined });
    setContent('');
    setCodeSnippet('');
    setShowCode(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-white mb-6">Your Answer</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your answer... (Markdown supported)"
        rows={6}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[160px]"
      />

      {!showCode ? (
        <button
          type="button"
          onClick={() => setShowCode(true)}
          className="text-base text-indigo-400 hover:text-indigo-300 mt-3"
        >
          + Add code snippet
        </button>
      ) : (
        <div className="mt-5">
          <label className="block text-base text-gray-400 mb-2">Code Snippet</label>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Paste your code here..."
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-base text-gray-100 font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button type="submit" loading={loading} disabled={!content.trim()}>
          Post Answer
        </Button>
      </div>
    </form>
  );
}
