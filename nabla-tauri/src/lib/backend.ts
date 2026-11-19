// Backend abstraction: Tauri (desktop) vs. nabla-server (web).
// Tauri modules are imported dynamically so the web build never touches them.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.nabla-sim.app";

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window &&
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== undefined
  );
}

export interface ExtraFile {
  name: string;
  content: string;
}

async function ensureOk(res: Response): Promise<Response> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error (${res.status}): ${text || res.statusText}`);
  }
  return res;
}

export async function getDefaultConfig(): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string>("get_default_config");
  }
  const res = await ensureOk(await fetch(`${API_BASE}/api/config/default`));
  const data: { config: string } = await res.json();
  return data.config;
}

export async function runSimulation<T>(
  configContent: string,
  isLoop: boolean,
  extraFiles: ExtraFile[],
): Promise<T> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>("run_simulation", { configContent, isLoop, extraFiles });
  }

  const form = new FormData();
  form.append("configContent", configContent);
  form.append("isLoop", String(isLoop));
  for (const file of extraFiles) {
    form.append("extraFiles", new Blob([file.content], { type: "text/plain" }), file.name);
  }
  const res = await ensureOk(
    await fetch(`${API_BASE}/api/simulate`, { method: "POST", body: form }),
  );
  return res.json();
}

/**
 * Save binary data to a file.
 * Tauri: native save dialog → returns chosen path, or null if cancelled.
 * Web: triggers a browser download → returns the file name.
 */
export async function saveFile(
  data: Uint8Array | Blob,
  defaultName: string,
  filter: { name: string; extensions: string[] },
): Promise<string | null> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({ filters: [filter], defaultPath: defaultName });
    if (!path) return null;
    const bytes = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
    await writeFile(path, bytes);
    return path;
  }

  const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return defaultName;
}
