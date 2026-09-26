function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              University Clearance System
            </h1>
            <p className="text-sm text-gray-500">
              Digital clearance management
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Login
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            University Clearance
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
            A simpler way to manage university clearance.
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            Students, officers, and registrars can manage the clearance
            process through one connected system.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
              Get Started
            </button>

            <button className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App