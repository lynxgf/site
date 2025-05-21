import AdminSidebar from './sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64 relative overflow-y-auto">
        {children}
      </main>
    </div>
  );
}