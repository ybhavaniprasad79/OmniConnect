import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function DashboardPage({ user }) {
  const nav = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    api("/api/workspaces", { headers: { Authorization: `Bearer ${token}` } })
      .then(setWorkspaces)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const ws = await api("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setWorkspaces([...workspaces, ws]);
      setForm({ name: "", description: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Manager Dashboard
        </h2>
        <p className="text-gray-600 mb-8">
          Welcome, {user.name}! Manage your workspaces below.
        </p>

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + Create New Workspace
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-4">Create Workspace</h3>
            <input
              type="text"
              placeholder="Workspace Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <p className="text-gray-600">
            No workspaces yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {ws.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {ws.description || "No description"}
                </p>
                <button
                  onClick={() => nav(`/dashboard/workspaces/${ws._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
