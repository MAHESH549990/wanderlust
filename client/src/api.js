export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = options.body instanceof FormData;
  if (options.body && !bodyIsFormData) headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers,
    body: options.body && !bodyIsFormData ? JSON.stringify(options.body) : options.body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export const imageFor = (listing) =>
  listing?.image?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

export const money = (value) => "₹" + Number(value || 0).toLocaleString("en-IN");
