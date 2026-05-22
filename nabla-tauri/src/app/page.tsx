"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useTheme } from "next-themes";
import {
  Play,
  Settings2,
  Rocket,
  Upload,
  X,
  FileSpreadsheet,
  Sun,
  Moon,
  Map as MapIcon,
  Code,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const MapViewer = dynamic(() => import("@/components/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground animate-pulse">
      Loading map...
    </div>
  ),
});

const MapViewerGoogle = dynamic(() => import("@/components/MapViewerGoogle"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground animate-pulse">
      Loading Google Maps...
    </div>
  ),
});

interface ExtraFile {
  name: string;
  content: string;
}

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

export default function Home() {
  const [configText, setConfigText] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("System ready.");
  const [isError, setIsError] = useState<boolean>(false);
  const [extraFiles, setExtraFiles] = useState<ExtraFile[]>([]);
  const [kmlData, setKmlData] = useState<Record<string, string>>({});
  const [launchPos, setLaunchPos] = useState<[number, number] | null>(null);
  const [launchRadius, setLaunchRadius] = useState<number>(0.0);

  const [safetyArea, setSafetyArea] = useState<[number, number][]>([]);
  const [ignitionRadius, setIgnitionRadius] = useState<number>(10.0);
  const [northWindPoints, setNorthWindPoints] = useState<[number, number][]>([]);
  const [northWindPointsTraj, setNorthWindPointsTraj] = useState<[number, number][]>([]);


  const [ignitionPos, setIgnitionPos] = useState<[number, number] | null>(null);

  const [activeTab, setActiveTab] = useState<string>("editor");

  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(false);
  const [googleApiKey, setGoogleApiKey] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tomlInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedApiKey = localStorage.getItem("googleApiKey");
    if (savedApiKey) setGoogleApiKey(savedApiKey);
    const savedUseGoogle = localStorage.getItem("useGoogleMaps");
    if (savedUseGoogle === "true") setUseGoogleMaps(true);

    async function loadConfig() {
      try {
        const defaultConfig = await invoke<string>("get_default_config");
        setConfigText(defaultConfig);
      } catch (err) {
        console.error("Failed to load default config:", err);
        setStatusMsg("Failed to load default configuration.");
        setIsError(true);
      }
    }
    loadConfig();
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("googleApiKey", googleApiKey);
    localStorage.setItem("useGoogleMaps", String(useGoogleMaps));
    setStatusMsg("Settings saved.");
  };

  const handleTomlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const text = await file.text();
      setConfigText(text);
      setStatusMsg(`Loaded TOML file: ${file.name}`);
    } catch (err) {
      console.error("Failed to read TOML file:", err);
      setStatusMsg("Failed to load TOML file.");
      setIsError(true);
    }
    if (tomlInputRef.current) tomlInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: ExtraFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      if (!extraFiles.some((f) => f.name === file.name)) {
        newFiles.push({ name: file.name, content: text });
      }
    }

    if (newFiles.length > 0) {
      setExtraFiles((prev) => [...prev, ...newFiles]);
      setStatusMsg(`Added ${newFiles.length} external file(s).`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (nameToRemove: string) => {
    setExtraFiles((prev) => prev.filter((f) => f.name !== nameToRemove));
  };

  const runSimulation = async (isLoop: boolean) => {
    setIsSimulating(true);
    setIsError(false);
    setStatusMsg(`Running ${isLoop ? "Dispersion (Loop)" : "Nominal"} simulation...\nThis may take a moment.`);

    try {
      const result = await invoke<SimulationResult>("run_simulation", {
        configContent: configText,
        isLoop: isLoop,
        extraFiles: extraFiles,
      });

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

      setStatusMsg("Simulation finished.\nWaiting for save location...");
      const uint8Array = Uint8Array.from(result.zip_bytes);

      const savePath = await save({
        filters: [{ name: "ZIP Archive", extensions: ["zip"] }],
        defaultPath: isLoop ? "dispersion_results.zip" : "nominal_results.zip",
      });

      if (savePath) {
        await writeFile(savePath, uint8Array);
        setStatusMsg(`Successfully saved results to:\n${savePath}`);
      } else {
        setStatusMsg("Simulation finished.\nSave cancelled by user.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setStatusMsg(`Error:\n${err}`);
      setIsError(true);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-background text-foreground p-3 flex flex-col items-center justify-center relative transition-colors duration-300 overflow-hidden">
      <div className="w-full max-w-[120rem] grid grid-cols-1 xl:grid-cols-4 gap-4 h-full">
        <div className="xl:col-span-3 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <TabsList className="grid w-fit grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="editor" className="flex items-center gap-2 font-medium px-6">
                  <Code className="w-4 h-4" /> Configuration
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2 font-medium px-6">
                  <MapIcon className="w-4 h-4" /> Flight Map
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 min-h-0 mt-0 flex flex-col gap-3 data-[state=active]:flex">
              <Card className="flex-1 flex flex-col shadow-sm overflow-hidden min-h-0 bg-card border-border">
                <CardHeader className="bg-muted/30 border-b border-border py-2 px-4 shrink-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                      <Settings2 className="w-4 h-4 text-muted-foreground" /> Editor
                    </CardTitle>
                    <div>
                      <input type="file" accept=".toml,.txt" className="hidden" ref={tomlInputRef} onChange={handleTomlUpload} disabled={isSimulating} />
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs px-2 bg-background" onClick={() => tomlInputRef.current?.click()} disabled={isSimulating}>
                        <Upload className="w-3.5 h-3.5" /> Upload TOML
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                  <Textarea
                    className="absolute inset-0 w-full h-full font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-4 resize-none bg-transparent text-foreground"
                    value={configText}
                    onChange={(e) => setConfigText(e.target.value)}
                    spellCheck={false}
                    disabled={isSimulating}
                  />
                </CardContent>
              </Card>

              <Card className="shrink-0 shadow-sm bg-card border-border">
                <CardHeader className="bg-muted/30 border-b border-border py-2 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
                      <FileSpreadsheet className="w-4 h-4 text-muted-foreground" /> External Files (CSV)
                    </CardTitle>
                    <div>
                      <input type="file" multiple accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs px-2 bg-background" onClick={() => fileInputRef.current?.click()} disabled={isSimulating}>
                        <Upload className="w-3.5 h-3.5" /> Add CSVs
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 min-h-[3rem] flex items-center">
                  {extraFiles.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center w-full">No external files added. Default configurations will be used.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {extraFiles.map((file) => (
                        <Badge key={file.name} variant="secondary" className="px-2 py-0.5 pr-1 flex items-center gap-1 font-medium text-xs">
                          <FileSpreadsheet className="w-3 h-3 text-muted-foreground" /> {file.name}
                          <button onClick={() => removeFile(file.name)} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors" disabled={isSimulating} title="Remove file">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=active]:flex">
              <Card className="flex-1 shadow-sm border-border bg-card overflow-hidden">
                <div className="w-full h-full relative">
                  {Object.keys(kmlData).length > 0 ? (
                    useGoogleMaps && googleApiKey ? (
                      <MapViewerGoogle kmlData={kmlData} launchPos={launchPos} safetyArea={safetyArea} ignitionRadius={ignitionRadius} northWindPoints={northWindPoints} northWindPointsTraj={northWindPointsTraj} launchRadius={launchRadius} ignitionPos={ignitionPos} apiKey={googleApiKey} />
                    ) : (
                      <MapViewer kmlData={kmlData} launchPos={launchPos} safetyArea={safetyArea} ignitionRadius={ignitionRadius} northWindPoints={northWindPoints} northWindPointsTraj={northWindPointsTraj} launchRadius={launchRadius} ignitionPos={ignitionPos} />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                      <MapIcon className="w-12 h-12 mb-4 text-muted-foreground/30" />
                      <p>No map data available.</p>
                      <p className="text-sm">Run a simulation to view the trajectory.</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col shadow-sm bg-card border-border overflow-hidden h-full">
          <CardHeader className="bg-muted/30 border-b border-border py-4 shrink-0 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg tracking-tight">
                <Rocket className="w-5 h-5 text-primary" /> Nabla Simulator
              </CardTitle>
              <CardDescription className="text-xs">Execution & Results</CardDescription>
            </div>
            
            <div className="flex gap-2">
              {mounted && (
                <Dialog>
                  <DialogTrigger>
                    <div className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-full cursor-pointer">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Application Settings</DialogTitle>
                      <DialogDescription>Configure map providers and API keys.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="use-google" className="flex flex-col gap-1 cursor-pointer">
                          <span>Use Google Maps</span>
                          <span className="font-normal text-[10px] text-muted-foreground">Requires a valid API key. Fallbacks to Esri if disabled.</span>
                        </Label>
                        <Switch id="use-google" checked={useGoogleMaps} onCheckedChange={setUseGoogleMaps} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="api-key">Google Maps API Key</Label>
                        <Input 
                          id="api-key" 
                          type="password"
                          value={googleApiKey} 
                          onChange={(e) => setGoogleApiKey(e.target.value)} 
                          placeholder="AIzaSy..." 
                          disabled={!useGoogleMaps}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveSettings} className="w-full">Save Changes</Button>
                  </DialogContent>
                </Dialog>
              )}

              {mounted && (
                <Button variant="outline" size="icon" className="rounded-full shadow-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
            <div className="space-y-3 shrink-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Simulation Controls</h3>
              <div className="flex flex-col gap-2.5">
                <Button className="w-full flex items-center gap-2" size="default" onClick={() => runSimulation(false)} disabled={isSimulating}>
                  <Play className="w-4 h-4" /> Run Nominal
                </Button>
                <Button className="w-full flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground" variant="secondary" size="default" onClick={() => runSimulation(true)} disabled={isSimulating}>
                  <Play className="w-4 h-4" /> Run Dispersion (Loop)
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 shrink-0">Status Log</h3>
              <div className={`flex-1 rounded-md p-3 text-xs font-mono whitespace-pre-wrap overflow-y-auto border shadow-inner ${isError ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-zinc-950 text-emerald-400 border-zinc-800"}`}>
                {statusMsg}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/30 border-t border-border p-3 flex justify-between items-center shrink-0">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
            <Badge variant={isSimulating ? "default" : "outline"} className={isSimulating ? "animate-pulse" : "text-muted-foreground"}>
              {isSimulating ? "Computing..." : "Idle"}
            </Badge>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
