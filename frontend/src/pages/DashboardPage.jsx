import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function DashboardPage({ user }) {
  const nav = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedWs, setSelectedWs] = useState(null);

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
                  onClick={() => setSelectedWs(ws._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedWs && (
          <WorkspaceDetail
            wsId={selectedWs}
            onClose={() => setSelectedWs(null)}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

function WorkspaceDetail({ wsId, onClose, user }) {
  const [ws, setWs] = useState(null);
  const [joins, setJoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: "", message: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      api(`/api/workspaces/${wsId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api(`/api/workspaces/${wsId}/pending-joins`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([w, j]) => {
        setWs(w);
        setJoins(j);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [wsId, token]);

  const handleAccept = async (jrId) => {
    try {
      await api(`/api/workspaces/${wsId}/join-requests/${jrId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoins(joins.filter((j) => j._id !== jrId));
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: wsId, ...announcement }),
      });
      setAnnouncement({ title: "", message: "" });
      alert("Announcement sent!");
    } catch (err) {
      console.error("Announcement failed", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{ws?.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Send Announcement
          </h4>
          <form onSubmit={handleAnnouncement} className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={announcement.title}
              onChange={(e) =>
                setAnnouncement({ ...announcement, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Message"
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement({ ...announcement, message: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Pending Join Requests ({joins.length})
          </h4>
          {joins.length === 0 ? (
            <p className="text-gray-600">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {joins.map((j) => (
                <div
                  key={j._id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{j.name}</p>
                    <p className="text-sm text-gray-600">{j.whatsappNumber}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(j._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
