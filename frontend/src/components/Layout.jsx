import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            University Clearance System
          </h2>

          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              🔔
            </button>

            <div className="text-sm font-medium text-gray-700">
              User
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;