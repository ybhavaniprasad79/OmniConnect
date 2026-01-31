import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function WorkspaceManagePage({ user }) {
  const { wsId } = useParams();
  const nav = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [pendingJoins, setPendingJoins] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    Promise.all([
      api(`/api/workspaces/${wsId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api(`/api/workspaces/${wsId}/pending-joins`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api(`/api/workspaces/${wsId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([ws, joins, mems]) => {
        setWorkspace(ws);
        setPendingJoins(joins);
        setMembers(mems);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [wsId, nav]);

  const token = localStorage.getItem("token");

  const handleAccept = async (jrId) => {
    try {
      const res = await api(
        `/api/workspaces/${wsId}/join-requests/${jrId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPendingJoins(pendingJoins.filter((j) => j._id !== jrId));
      if (res && res.member) {
        setMembers([...members, res.member]);
      }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p>Please log in first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p>Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {workspace?.name}
            </h2>
            <p className="text-gray-600">Manage members and announcements</p>
          </div>
          <button
            onClick={() => nav("/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Send Announcement
            </h3>
            <form onSubmit={handleAnnouncement} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={announcement.title}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <textarea
                placeholder="Message"
                value={announcement.message}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, message: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Send
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pending Join Requests ({pendingJoins.length})
            </h3>
            {pendingJoins.length === 0 ? (
              <p className="text-sm text-gray-600">No pending requests.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pendingJoins.map((j) => (
                  <div
                    key={j._id}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {j.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {j.whatsappNumber}
                      </p>
                      {j.email && (
                        <p className="text-xs text-gray-500">{j.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAccept(j._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Members ({members.length})
          </h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-600">No members yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((m) => (
                <div
                  key={m._id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-600">{m.whatsappNumber}</p>
                    {m.email && (
                      <p className="text-xs text-gray-500">{m.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
