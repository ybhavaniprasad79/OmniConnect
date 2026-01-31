const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function api(path, opts = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }
  if (!res.ok) throw { status: res.status, body };
  return body;
}

export default api;
