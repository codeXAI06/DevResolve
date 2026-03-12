import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function PageLayout({ children, sidebar = true }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-10">
        <div className="flex gap-12">
          {sidebar && <Sidebar />}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
