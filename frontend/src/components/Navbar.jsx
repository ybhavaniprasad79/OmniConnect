import { Link } from "react-router-dom";

export default function NavBar({ user, onLogout }) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              OmniConnect
            </h1>
          </Link>
          <div className="flex gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-700 self-center">
                  Hi, {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
