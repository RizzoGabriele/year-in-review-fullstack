export async function apiFetch(path, options = {}) { //permette di usare le api in una sola riga senza dover gestire ad esempio cookie, res.ok, e fa funzionare anche i login con i cookie
  const res = await fetch(path, {
    credentials: "include",  //invia i cookie di sessione
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch {
    data = null;
  }

  // Errore HTTP
  if (!res.ok) {
    const err = new Error(
      data?.error || data || `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
