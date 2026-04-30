"use client";

import { useState, useEffect, useRef } from "react";
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

interface ExtraFile {
  name: string;
  content: string;
}

export default function Home() {
  const [configText, setConfigText] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("System ready.");
  const [isError, setIsError] = useState<boolean>(false);
  const [extraFiles, setExtraFiles] = useState<ExtraFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fetch default configuration from Rust backend on load
  useEffect(() => {
    setMounted(true);
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

  // Handle simulation execution and ZIP download
  const runSimulation = async (isLoop: boolean) => {
    setIsSimulating(true);
    setIsError(false);
    setStatusMsg(
      `Running ${isLoop ? "Dispersion (Loop)" : "Nominal"} simulation...\nThis may take a moment.`,
    );

    try {
      // Invoke Rust backend
      const zipBytes = await invoke<number[]>("run_simulation", {
        configContent: configText,
        isLoop: isLoop,
        extraFiles: extraFiles,
      });

      setStatusMsg("Simulation finished.\nWaiting for save location...");
      const uint8Array = Uint8Array.from(zipBytes);

      // Prompt user to select a save location
      const savePath = await save({
        filters: [
          {
            name: "ZIP Archive",
            extensions: ["zip"],
          },
        ],
        defaultPath: isLoop ? "dispersion_results.zip" : "nominal_results.zip",
      });

      if (savePath) {
        // Write the file to the selected path
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
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center justify-center relative transition-colors duration-300">
      {/* Theme Toggle */}
      {mounted && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 h-[90vh]">
        {/* Left Column: TOML Editor & Extra Files */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          {/* TOML Editor */}
          <Card className="flex-1 flex flex-col shadow-sm overflow-hidden min-h-0 bg-card border-border">
            <CardHeader className="bg-muted/30 border-b border-border pb-4 shrink-0">
              <CardTitle className="flex items-center gap-2 text-lg tracking-tight">
                <Settings2 className="w-5 h-5 text-muted-foreground" />
                Configuration Editor
              </CardTitle>
              <CardDescription>
                Edit your rocket simulation parameters in TOML format.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <Textarea
                className="w-full h-full font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-6 resize-none bg-transparent text-foreground"
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                spellCheck={false}
                disabled={isSimulating}
              />
            </CardContent>
          </Card>

          {/* External CSV Files Upload */}
          <Card className="shrink-0 shadow-sm bg-card border-border">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-6">
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
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSimulating}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Add CSVs
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {extraFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2 italic">
                  No external files added. Upload thrust or aerodynamics data
                  here.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {extraFiles.map((file) => (
                    <Badge
                      key={file.name}
                      variant="secondary"
                      className="px-2 py-1 pr-1 flex items-center gap-1 font-medium"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-muted-foreground" />
                      {file.name}
                      <button
                        onClick={() => removeFile(file.name)}
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
        </div>

        {/* Right Column: Controls & Log */}
        <Card className="flex flex-col shadow-sm bg-card border-border overflow-hidden h-full">
          <CardHeader className="bg-muted/30 border-b border-border pb-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg tracking-tight">
              <Rocket className="w-5 h-5 text-primary" />
              Nabla Simulator
            </CardTitle>
            <CardDescription>Execution & Results</CardDescription>
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
                  className="w-full flex items-center gap-2"
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
                isSimulating ? "animate-pulse" : "text-muted-foreground"
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
