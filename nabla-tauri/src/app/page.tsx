"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  getDefaultConfig,
  runSimulation as runBackendSimulation,
  saveFile,
  isTauri,
  API_BASE,
  type ExtraFile,
} from "@/lib/backend";
import { useTheme } from "next-themes";
import {
  Play,
  Repeat,
  Upload,
  X,
  FileSpreadsheet,
  Sun,
  Moon,
  Map as MapIcon,
  FileCode2,
  Download,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsDialog, { type MapSettings } from "@/components/SettingsDialog";
import { cn } from "@/lib/utils";

const MapLoading = ({ label }: { label: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground text-sm">
    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {label}
  </div>
);

const MapViewer = dynamic(() => import("@/components/MapViewer"), {
  ssr: false,
  loading: () => <MapLoading label="Loading map..." />,
});

const MapViewerGoogle = dynamic(() => import("@/components/MapViewerGoogle"), {
  ssr: false,
  loading: () => <MapLoading label="Loading Google Maps..." />,
});

interface SimulationResult {
  zip_bytes: number[];
  kml_files: Record<string, string>;
  launch_pos: [number, number];
  safety_area: [number, number][];
  ignition_pos?: [number, number];
  launch_radius: number;
  ignition_radius: number;
  north_wind_points: [number, number][];
  north_wind_points_traj: [number, number][];
}

type LogLevel = "info" | "success" | "error";

interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
}

interface LastResult {
  bytes: Uint8Array;
  isLoop: boolean;
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between h-7 mb-2">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{children}</h3>
      {action}
    </div>
  );
}

export default function Home() {
  const [configText, setConfigText] = useState<string>("");
  const [configFileName, setConfigFileName] = useState<string>("default.toml");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [runningMode, setRunningMode] = useState<"nominal" | "loop" | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [extraFiles, setExtraFiles] = useState<ExtraFile[]>([]);
  const [kmlData, setKmlData] = useState<Record<string, string>>({});
  const [launchPos, setLaunchPos] = useState<[number, number] | null>(null);
  const [launchRadius, setLaunchRadius] = useState<number>(0.0);
  const [safetyArea, setSafetyArea] = useState<[number, number][]>([]);
  const [ignitionRadius, setIgnitionRadius] = useState<number>(10.0);
  const [northWindPoints, setNorthWindPoints] = useState<[number, number][]>([]);
  const [northWindPointsTraj, setNorthWindPointsTraj] = useState<[number, number][]>([]);
  const [ignitionPos, setIgnitionPos] = useState<[number, number] | null>(null);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const [activeTab, setActiveTab] = useState<string>("editor");

  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(false);
  const [googleApiKey, setGoogleApiKey] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tomlInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const log = useCallback((message: string, level: LogLevel = "info") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, time: formatTime(new Date()), level, message }]);
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedApiKey = localStorage.getItem("googleApiKey");
    if (savedApiKey) setGoogleApiKey(savedApiKey);
    if (localStorage.getItem("useGoogleMaps") === "true") setUseGoogleMaps(true);

    (async () => {
      try {
        const defaultConfig = await getDefaultConfig();
        setConfigText(defaultConfig);
        log(
          isTauri()
            ? "System ready. Default configuration loaded."
            : `System ready (web mode, server: ${API_BASE}). Default configuration loaded.`,
        );
      } catch (err) {
        console.error("Failed to load default config:", err);
        log(`Failed to load default configuration: ${err}`, "error");
      }
    })();
  }, [log]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [logs]);

  const handleSaveSettings = (next: MapSettings) => {
    setUseGoogleMaps(next.useGoogleMaps);
    setGoogleApiKey(next.googleApiKey);
    localStorage.setItem("googleApiKey", next.googleApiKey);
    localStorage.setItem("useGoogleMaps", String(next.useGoogleMaps));
    log(`Settings saved. Map provider: ${next.useGoogleMaps ? "Google Maps" : "Esri"}.`, "success");
  };

  const handleTomlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setConfigText(await file.text());
      setConfigFileName(file.name);
      log(`Loaded configuration: ${file.name}`, "success");
    } catch (err) {
      console.error("Failed to read TOML file:", err);
      log(`Failed to load TOML file: ${err}`, "error");
    }
    if (tomlInputRef.current) tomlInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: ExtraFile[] = [];
    for (const file of Array.from(files)) {
      if (!extraFiles.some((f) => f.name === file.name) && !newFiles.some((f) => f.name === file.name)) {
        newFiles.push({ name: file.name, content: await file.text() });
      }
    }

    if (newFiles.length > 0) {
      setExtraFiles((prev) => [...prev, ...newFiles]);
      log(`Added ${newFiles.length} external file(s): ${newFiles.map((f) => f.name).join(", ")}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (name: string) => {
    setExtraFiles((prev) => prev.filter((f) => f.name !== name));
    log(`Removed external file: ${name}`);
  };

  const saveResult = async (result: LastResult) => {
    const savePath = await saveFile(
      result.bytes,
      result.isLoop ? "dispersion_results.zip" : "nominal_results.zip",
      { name: "ZIP Archive", extensions: ["zip"] },
    );
    if (savePath) {
      log(`Saved results to ${savePath}`, "success");
    } else {
      log("Save cancelled. Use “Save Results” to export later.");
    }
  };

  const handleSaveAgain = async () => {
    if (!lastResult) return;
    try {
      await saveResult(lastResult);
    } catch (err) {
      log(`Failed to save results: ${err}`, "error");
    }
  };

  const runSimulation = async (isLoop: boolean) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setRunningMode(isLoop ? "loop" : "nominal");
    const label = isLoop ? "Dispersion (Loop)" : "Nominal";
    log(`Running ${label} simulation...`);
    const started = performance.now();

    try {
      const result = await runBackendSimulation<SimulationResult>(configText, isLoop, extraFiles);

      const elapsed = ((performance.now() - started) / 1000).toFixed(2);
      log(`${label} simulation finished in ${elapsed}s.`, "success");

      if (result.kml_files && Object.keys(result.kml_files).length > 0) {
        setKmlData(result.kml_files);
        setLaunchPos(result.launch_pos);
        setLaunchRadius(result.launch_radius || 0.0);
        setSafetyArea(result.safety_area || []);
        setIgnitionRadius(result.ignition_radius || 10.0);
        setNorthWindPoints(result.north_wind_points || []);
        setNorthWindPointsTraj(result.north_wind_points_traj || []);
        setIgnitionPos(result.ignition_pos || null);
        setActiveTab("map");
      }

      const packed: LastResult = { bytes: Uint8Array.from(result.zip_bytes), isLoop };
      setLastResult(packed);
      await saveResult(packed);
    } catch (err) {
      console.error("Simulation error:", err);
      log(String(err), "error");
    } finally {
      setIsSimulating(false);
      setRunningMode(null);
    }
  };

  // Cmd/Ctrl + Enter → Nominal, Cmd/Ctrl + Shift + Enter → Dispersion
  const runRef = useRef(runSimulation);
  runRef.current = runSimulation;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current(e.shiftKey);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasMap = Object.keys(kmlData).length > 0;
  const lineCount = Math.max(configText.split("\n").length, 1);
  const isMac = mounted && /Mac/i.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl+";

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 gap-0">
        {/* ── Top bar ─────────────────────────────── */}
        <header className="h-12 shrink-0 flex items-center gap-4 px-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={28} height={28} className="size-7 shrink-0 select-none" draggable={false} />
            <span className="font-semibold tracking-tight whitespace-nowrap">Nabla Simulator</span>
          </div>

          <TabsList className="mx-auto">
            <TabsTrigger value="editor" className="px-3">
              <FileCode2 /> Configuration
            </TabsTrigger>
            <TabsTrigger value="map" className="px-3">
              <MapIcon /> Flight Map
              {hasMap && <span className="size-1.5 rounded-full bg-primary" />}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1">
            <SettingsDialog
              value={{ useGoogleMaps, googleApiKey }}
              onSave={handleSaveSettings}
            />

            <Button
              variant="ghost"
              size="icon"
              title="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* ── Main area ─────────────────────────── */}
          <section className="flex-1 min-w-0 flex flex-col p-3">
            <TabsContent value="editor" className="flex-1 min-h-0 flex flex-col rounded-lg border border-border bg-card overflow-hidden">
              <div className="h-10 shrink-0 flex items-center justify-between gap-2 px-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 min-w-0 text-sm">
                  <FileCode2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{configFileName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">TOML · {lineCount} lines</span>
                </div>
                <input type="file" accept=".toml,.txt" className="hidden" ref={tomlInputRef} onChange={handleTomlUpload} />
                <Button variant="outline" size="sm" onClick={() => tomlInputRef.current?.click()} disabled={isSimulating}>
                  <Upload /> Open TOML
                </Button>
              </div>
              <div className="flex-1 min-h-0 flex font-mono text-[13px] leading-5">
                <div
                  ref={gutterRef}
                  aria-hidden
                  className="shrink-0 overflow-hidden select-none py-3 pl-3 pr-3 text-right text-muted-foreground/50 bg-muted/20 border-r border-border"
                >
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  className="flex-1 min-w-0 h-full resize-none bg-transparent py-3 px-4 outline-none whitespace-pre overflow-auto text-foreground disabled:opacity-60"
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  onScroll={(e) => {
                    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                  }}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  wrap="off"
                  disabled={isSimulating}
                />
              </div>
            </TabsContent>

            <TabsContent value="map" className="flex-1 min-h-0 rounded-lg border border-border bg-card overflow-hidden relative">
              {hasMap ? (
                useGoogleMaps && googleApiKey ? (
                  <MapViewerGoogle kmlData={kmlData} launchPos={launchPos} safetyArea={safetyArea} ignitionRadius={ignitionRadius} northWindPoints={northWindPoints} northWindPointsTraj={northWindPointsTraj} launchRadius={launchRadius} ignitionPos={ignitionPos} apiKey={googleApiKey} />
                ) : (
                  <MapViewer kmlData={kmlData} launchPos={launchPos} safetyArea={safetyArea} ignitionRadius={ignitionRadius} northWindPoints={northWindPoints} northWindPointsTraj={northWindPointsTraj} launchRadius={launchRadius} ignitionPos={ignitionPos} />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/10">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                    <MapIcon className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">No map data yet</p>
                    <p className="text-xs">Run a simulation to view the trajectory.</p>
                  </div>
                  <Button size="sm" onClick={() => runSimulation(false)} disabled={isSimulating}>
                    <Play /> Run Nominal
                  </Button>
                </div>
              )}
            </TabsContent>
          </section>

          {/* ── Sidebar ───────────────────────────── */}
          <aside className="w-120 shrink-0 flex flex-col min-h-0 border-l border-border bg-card/40">
            <div className="p-4 border-b border-border">
              <SectionTitle>Run Simulation</SectionTitle>
              <div className="flex flex-col gap-2">
                <Button className="w-full h-10 justify-between" onClick={() => runSimulation(false)} disabled={isSimulating}>
                  <span className="flex items-center gap-2">
                    {runningMode === "nominal" ? <Loader2 className="animate-spin" /> : <Play />} Nominal
                  </span>
                  <kbd className="text-[10px] font-mono opacity-70">{mod}↵</kbd>
                </Button>
                <Button variant="outline" className="w-full h-10 justify-between" onClick={() => runSimulation(true)} disabled={isSimulating}>
                  <span className="flex items-center gap-2">
                    {runningMode === "loop" ? <Loader2 className="animate-spin" /> : <Repeat />} Dispersion (Loop)
                  </span>
                  <kbd className="text-[10px] font-mono text-muted-foreground">{mod}⇧↵</kbd>
                </Button>
                {lastResult && (
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleSaveAgain} disabled={isSimulating}>
                    <Download /> Save Results (.zip)
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <SectionTitle
                action={
                  <>
                    <input type="file" multiple accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <Button variant="ghost" size="icon-sm" title="Add CSV files" onClick={() => fileInputRef.current?.click()} disabled={isSimulating}>
                      <Plus />
                    </Button>
                  </>
                }
              >
                External Files
                {extraFiles.length > 0 && <span className="ml-1.5 text-primary">{extraFiles.length}</span>}
              </SectionTitle>
              {extraFiles.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSimulating}
                  className="w-full rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  Add CSV files (thrust, wind, etc.)
                </button>
              ) : (
                <ul className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {extraFiles.map((file) => (
                    <li key={file.name} className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs bg-muted/40">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1" title={file.name}>{file.name}</span>
                      <button
                        onClick={() => removeFile(file.name)}
                        disabled={isSimulating}
                        className="rounded p-0.5 text-muted-foreground opacity-60 group-hover:opacity-100 hover:bg-muted-foreground/20 hover:text-foreground transition"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col p-4">
              <SectionTitle
                action={
                  logs.length > 0 && (
                    <Button variant="ghost" size="icon-sm" title="Clear log" onClick={() => setLogs([])}>
                      <Trash2 />
                    </Button>
                  )
                }
              >
                Log
              </SectionTitle>
              <div className="flex-1 min-h-0 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 font-mono text-[11px] leading-relaxed">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground/60 p-1">No messages.</p>
                ) : (
                  logs.map((entry) => (
                    <div key={entry.id} className="flex gap-2 px-1 py-0.5">
                      <span className="text-muted-foreground/60 shrink-0">{entry.time}</span>
                      <span
                        className={cn(
                          "whitespace-pre-wrap break-all",
                          entry.level === "error" && "text-red-500 dark:text-red-400",
                          entry.level === "success" && "text-primary",
                          entry.level === "info" && "text-foreground/80"
                        )}
                      >
                        {entry.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            <footer className="h-9 shrink-0 flex items-center gap-2 px-4 border-t border-border text-xs text-muted-foreground">
              <span
                className={cn(
                  "size-2 rounded-full",
                  isSimulating ? "bg-amber-500 animate-pulse" : "bg-primary"
                )}
              />
              {isSimulating ? "Computing..." : "Idle"}
            </footer>
          </aside>
        </div>
      </Tabs>
    </main>
  );
}
