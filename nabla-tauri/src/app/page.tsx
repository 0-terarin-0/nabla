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

// Dynamically import MapViewer to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import("@/components/MapViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground animate-pulse">
            Loading map...
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
}

export default function Home() {
    const [configText, setConfigText] = useState<string>("");
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<string>("System ready.");
    const [isError, setIsError] = useState<boolean>(false);
    const [extraFiles, setExtraFiles] = useState<ExtraFile[]>([]);
    const [kmlData, setKmlData] = useState<Record<string, string>>({});
    const [launchPos, setLaunchPos] = useState<[number, number] | null>(null);
    const [safetyArea, setSafetyArea] = useState<[number, number][]>([]);
    const [activeTab, setActiveTab] = useState<string>("editor");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const tomlInputRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Fetch default configuration from Rust backend on load
    useEffect(() => {
        setMounted(true);
        async function loadConfig() {
            try {
                let defaultConfig = "";
                if (
                    typeof window !== "undefined" &&
                    "__TAURI_INTERNALS__" in window
                ) {
                    defaultConfig = await invoke<string>("get_default_config");
                } else {
                    const API_BASE =
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:3001";
                    const res = await fetch(`${API_BASE}/api/config/default`);
                    if (!res.ok)
                        throw new Error(
                            "Failed to fetch default config from server",
                        );
                    const data = await res.json();
                    defaultConfig = data.config;
                }
                setConfigText(defaultConfig);
            } catch (err) {
                console.error("Failed to load default config:", err);
                setStatusMsg("Failed to load default configuration.");
                setIsError(true);
            }
        }
        loadConfig();
    }, []);

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
            // Avoid adding duplicates with the same name
            if (!extraFiles.some((f) => f.name === file.name)) {
                newFiles.push({ name: file.name, content: text });
            }
        }

        if (newFiles.length > 0) {
            setExtraFiles((prev) => [...prev, ...newFiles]);
            setStatusMsg(`Added ${newFiles.length} external file(s).`);
        }

        // Reset file input so the same file can be selected again if removed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (nameToRemove: string) => {
        setExtraFiles((prev) => prev.filter((f) => f.name !== nameToRemove));
    };

    // Handle simulation execution, map rendering, and ZIP download
    const runSimulation = async (isLoop: boolean) => {
        setIsSimulating(true);
        setIsError(false);
        setStatusMsg(
            `Running ${isLoop ? "Dispersion (Loop)" : "Nominal"} simulation...\nThis may take a moment.`,
        );

        try {
            let result: SimulationResult;
            const isTauriEnv =
                typeof window !== "undefined" &&
                "__TAURI_INTERNALS__" in window;

            if (isTauriEnv) {
                // Invoke Rust backend via Tauri
                result = await invoke<SimulationResult>("run_simulation", {
                    configContent: configText,
                    isLoop: isLoop,
                    extraFiles: extraFiles,
                });
            } else {
                // Use Web API backend
                const formData = new FormData();
                formData.append("configContent", configText);
                formData.append("isLoop", isLoop.toString());

                extraFiles.forEach((file) => {
                    const blob = new Blob([file.content], { type: "text/csv" });
                    formData.append("extraFiles", blob, file.name);
                });

                const API_BASE =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const res = await fetch(`${API_BASE}/api/simulate`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server error: ${errorText}`);
                }

                result = await res.json();
            }

            // Set KML data and launch pos for map rendering and switch tab
            if (result.kml_files && Object.keys(result.kml_files).length > 0) {
                setKmlData(result.kml_files);
                setLaunchPos(result.launch_pos);
                setSafetyArea(result.safety_area || []);
                setActiveTab("map");
            }

            setStatusMsg(
                "Simulation finished.\nPreparing results for download...",
            );

            // Convert number array to Uint8Array for ZIP download
            const uint8Array = Uint8Array.from(result.zip_bytes);

            const defaultFileName = isLoop
                ? "dispersion_results.zip"
                : "nominal_results.zip";

            if (isTauriEnv) {
                // Prompt user to select a save location via Tauri
                const savePath = await save({
                    filters: [{ name: "ZIP Archive", extensions: ["zip"] }],
                    defaultPath: defaultFileName,
                });

                if (savePath) {
                    await writeFile(savePath, uint8Array);
                    setStatusMsg(`Successfully saved results to:\n${savePath}`);
                } else {
                    setStatusMsg(
                        "Simulation finished.\nSave cancelled by user.",
                    );
                }
            } else {
                // Browser download trigger
                const blob = new Blob([uint8Array], {
                    type: "application/zip",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = defaultFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setStatusMsg(
                    `Successfully downloaded results to: ${defaultFileName}`,
                );
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
                {/* Left Column: Tabs (Editor / Map) */}
                <div className="xl:col-span-3 flex flex-col min-h-0 overflow-hidden">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col min-h-0 overflow-hidden"
                    >
                        <TabsList className="grid w-fit grid-cols-2 mb-2 bg-muted/50 p-1">
                            <TabsTrigger
                                value="editor"
                                className="flex items-center gap-2 font-medium px-6"
                            >
                                <Code className="w-4 h-4" />
                                Configuration
                            </TabsTrigger>
                            <TabsTrigger
                                value="map"
                                className="flex items-center gap-2 font-medium px-6"
                            >
                                <MapIcon className="w-4 h-4" />
                                Flight Map
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="editor"
                            className="flex-1 min-h-0 mt-0 flex flex-col gap-3 data-[state=active]:flex"
                        >
                            {/* TOML Editor */}
                            <Card className="flex-1 flex flex-col shadow-sm overflow-hidden min-h-0 bg-card border-border">
                                <CardHeader className="bg-muted/30 border-b border-border py-2 px-4 shrink-0">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                                            <Settings2 className="w-4 h-4 text-muted-foreground" />
                                            Editor
                                        </CardTitle>
                                        <div>
                                            <input
                                                type="file"
                                                accept=".toml,.txt"
                                                className="hidden"
                                                ref={tomlInputRef}
                                                onChange={handleTomlUpload}
                                                disabled={isSimulating}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1 text-xs px-2 bg-background"
                                                onClick={() =>
                                                    tomlInputRef.current?.click()
                                                }
                                                disabled={isSimulating}
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload TOML
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-hidden relative">
                                    <Textarea
                                        className="absolute inset-0 w-full h-full font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-4 resize-none bg-transparent text-foreground"
                                        value={configText}
                                        onChange={(e) =>
                                            setConfigText(e.target.value)
                                        }
                                        spellCheck={false}
                                        disabled={isSimulating}
                                    />
                                </CardContent>
                            </Card>

                            {/* External CSV Files Upload */}
                            <Card className="shrink-0 shadow-sm bg-card border-border">
                                <CardHeader className="bg-muted/30 border-b border-border py-2 px-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
                                            <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                                            External Files (CSV)
                                        </CardTitle>
                                        <div>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".csv"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1 text-xs px-2 bg-background"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={isSimulating}
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Add CSVs
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 min-h-[3rem] flex items-center">
                                    {extraFiles.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic text-center w-full">
                                            No external files added.
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {extraFiles.map((file) => (
                                                <Badge
                                                    key={file.name}
                                                    variant="secondary"
                                                    className="px-2 py-0.5 pr-1 flex items-center gap-1 font-medium text-xs"
                                                >
                                                    <FileSpreadsheet className="w-3 h-3 text-muted-foreground" />
                                                    {file.name}
                                                    <button
                                                        onClick={() =>
                                                            removeFile(
                                                                file.name,
                                                            )
                                                        }
                                                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                                        disabled={isSimulating}
                                                        title="Remove file"
                                                    >
                                                        <X className="w-3 h-3 text-muted-foreground" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent
                            value="map"
                            className="flex-1 flex flex-col min-h-0 mt-0 data-[state=active]:flex"
                        >
                            <Card className="flex-1 shadow-sm border-border bg-card overflow-hidden">
                                <div className="w-full h-full relative">
                                    {Object.keys(kmlData).length > 0 ? (
                                        <MapViewer
                                            kmlData={kmlData}
                                            launchPos={launchPos}
                                            safetyArea={safetyArea}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                                            <MapIcon className="w-12 h-12 mb-4 text-muted-foreground/30" />
                                            <p>No map data available.</p>
                                            <p className="text-sm">
                                                Run a simulation to view the
                                                trajectory.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Controls & Log */}
                <Card className="flex flex-col shadow-sm bg-card border-border overflow-hidden h-full">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4 shrink-0 flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg tracking-tight">
                                <Rocket className="w-5 h-5 text-primary" />
                                Nabla Simulator
                            </CardTitle>
                            <CardDescription>
                                Execution & Results
                            </CardDescription>
                        </div>
                        {mounted && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() =>
                                    setTheme(
                                        theme === "dark" ? "light" : "dark",
                                    )
                                }
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="p-6 flex-1 flex flex-col gap-8 overflow-hidden min-h-0">
                        <div className="space-y-4 shrink-0">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Simulation Controls
                            </h3>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full flex items-center gap-2"
                                    size="lg"
                                    onClick={() => runSimulation(false)}
                                    disabled={isSimulating}
                                >
                                    <Play className="w-4 h-4" />
                                    Run Nominal
                                </Button>
                                <Button
                                    className="w-full flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => runSimulation(true)}
                                    disabled={isSimulating}
                                >
                                    <Play className="w-4 h-4" />
                                    Run Dispersion (Loop)
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 shrink-0">
                                Status Log
                            </h3>
                            <div
                                className={`flex-1 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap overflow-y-auto border shadow-inner ${
                                    isError
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : "bg-zinc-950 text-emerald-400 border-zinc-800"
                                }`}
                            >
                                {statusMsg}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border p-4 flex justify-between items-center shrink-0">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            System Status
                        </span>
                        <Badge
                            variant={isSimulating ? "default" : "outline"}
                            className={
                                isSimulating
                                    ? "animate-pulse"
                                    : "text-muted-foreground"
                            }
                        >
                            {isSimulating ? "Computing..." : "Idle"}
                        </Badge>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
