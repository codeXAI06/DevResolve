import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Lock, User } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 text-3xl font-bold text-white mb-3">
            <Code2 className="h-9 w-9 text-indigo-500" />
            Dev<span className="text-indigo-400">Resolve</span>
          </Link>
          <p className="text-gray-400 text-lg">Welcome back, developer</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-7">
            <Input
              label="Username"
              icon={<User className="h-4 w-4" />}
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Log In
            </Button>
          </form>

          <p className="text-center text-base text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
