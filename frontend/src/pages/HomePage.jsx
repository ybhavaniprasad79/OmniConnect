import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedWs, setSelectedWs] = useState(null);
  const [joinForm, setJoinForm] = useState({
    name: "",
    whatsappCountry: "+91",
    whatsappNumber: "",
    phoneCountry: "+91",
    phoneNumber: "",
    email: "",
  });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const nav = useNavigate();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await api(
        `/api/public/search?q=${encodeURIComponent(query)}`,
      );
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinClick = (wsId) => {
    setSelectedWs(wsId);
    setJoinForm({
      name: "",
      whatsappCountry: "+91",
      whatsappNumber: "",
      phoneCountry: "+91",
      phoneNumber: "",
      email: "",
    });
    setJoinError("");
    setJoinSuccess(false);
  };

  const normalizeWithCountry = (countryCode, localNumber) => {
    const digits = String(localNumber || "").replace(/\D/g, "");
    if (!digits) return "";
    const cc = countryCode || "+91";
    return cc + digits;
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinError("");
    setJoinLoading(true);
    try {
      const normalizedWhatsApp = normalizeWithCountry(
        joinForm.whatsappCountry,
        joinForm.whatsappNumber,
      );
      const normalizedPhone = normalizeWithCountry(
        joinForm.phoneCountry,
        joinForm.phoneNumber,
      );
      const payload = {
        workspaceId: selectedWs,
        name: joinForm.name,
        whatsappNumber: normalizedWhatsApp,
        phoneNumber: normalizedPhone,
        email: joinForm.email,
      };

      await api("/api/public/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setJoinSuccess(true);
      setTimeout(() => {
        setSelectedWs(null);
        setJoinForm({
          name: "",
          whatsappCountry: "+91",
          whatsappNumber: "",
          phoneCountry: "+91",
          phoneNumber: "",
          email: "",
        });
      }, 2000);
    } catch (err) {
      setJoinError(err.body?.error || "Join request failed");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <main className="flex-grow px-4 sm:px-6 lg:px-8">
        <section className="py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Animation / Illustration */}
            <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative w-[320px] h-[420px] bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60">
                <div className="absolute inset-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100">
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      OmniConnect
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Live
                    </span>
                  </div>

                  {/* Animated Message Flow */}
                  <div className="absolute top-16 left-6 right-6 space-y-4">
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-left animate-fadeIn">
                      <span className="text-xs text-gray-600 block">
                        Order confirmed
                      </span>
                      <span className="text-[10px] text-gray-400">
                        WhatsApp
                      </span>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-right ml-8 animate-fadeIn animation-delay-2">
                      <span className="text-xs text-gray-600 block">
                        Shipment in transit
                      </span>
                      <span className="text-[10px] text-gray-400">SMS</span>
                    </div>
                    <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3 text-left animate-fadeIn animation-delay-4">
                      <span className="text-xs text-gray-600 block">
                        Invoice sent
                      </span>
                      <span className="text-[10px] text-gray-400">Email</span>
                    </div>
                  </div>

                  {/* Channel Icons Row */}
                  <div className="absolute bottom-8 left-6 right-6 grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                      <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2"></div>
                      <span className="text-[10px] text-gray-700 font-semibold">
                        WhatsApp
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-2"></div>
                      <span className="text-[10px] text-gray-700 font-semibold">
                        SMS
                      </span>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mx-auto mb-2"></div>
                      <span className="text-[10px] text-gray-700 font-semibold">
                        Email
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Connection Dots */}
                <div className="absolute -left-6 top-16 w-12 h-12 rounded-full bg-blue-100 shadow-md animate-float"></div>
                <div
                  className="absolute -right-6 bottom-16 w-10 h-10 rounded-full bg-indigo-100 shadow-md animate-float"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-4xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                Reliable Multi-Channel{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Business Messaging
                </span>
              </h2>
              <p className="text-center lg:text-left text-gray-600 mb-12 max-w-3xl lg:max-w-none">
                OmniConnect helps businesses send automated notifications
                seamlessly across WhatsApp, SMS, and Email with intelligent
                fallback routing.
              </p>

              <div className="mb-16">
                <div className="max-w-xl mx-auto lg:mx-0 relative">
                  <form className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Find a Workspace
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Search for a workspace to join
                    </p>
                    <div>
                      <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </form>

                  {results.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
                      {results.map((ws) => (
                        <div
                          key={ws._id}
                          className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center transition"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {ws.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {ws.description || "No description"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleJoinClick(ws._id)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center mt-8 lg:mt-0">
                <a
                  href="/signup"
                  className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition"
                >
                  Create Workspace
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm">
          © 2026 OmniConnect. All rights reserved.
        </div>
      </footer>

      {/* Floating Join Modal */}
      {selectedWs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            {joinSuccess ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Request Sent!
                </h2>
                <p className="text-gray-600">
                  Your join request has been submitted. The workspace manager
                  will review it shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Join Workspace
                  </h2>
                  <button
                    onClick={() => setSelectedWs(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Complete your information to request access
                </p>
                {joinError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {joinError}
                  </div>
                )}
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={joinForm.name}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <select
                      value={joinForm.whatsappCountry}
                      onChange={(e) =>
                        setJoinForm({
                          ...joinForm,
                          whatsappCountry: e.target.value,
                        })
                      }
                      className="w-28 px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none text-sm"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="WhatsApp Number (local)"
                      value={joinForm.whatsappNumber}
                      onChange={(e) =>
                        setJoinForm({
                          ...joinForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={joinForm.phoneCountry}
                      onChange={(e) =>
                        setJoinForm({
                          ...joinForm,
                          phoneCountry: e.target.value,
                        })
                      }
                      className="w-28 px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none text-sm"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone Number (local)"
                      value={joinForm.phoneNumber}
                      onChange={(e) =>
                        setJoinForm({
                          ...joinForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={joinForm.email}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={joinLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 text-sm"
                    >
                      {joinLoading ? "Submitting..." : "Submit Request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWs(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-300 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
