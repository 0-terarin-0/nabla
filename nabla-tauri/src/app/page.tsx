"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

export default function Home() {
  const [configText, setConfigText] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("Ready.");

  // Fetch default configuration from Rust backend on load
  useEffect(() => {
    async function loadConfig() {
      try {
        const defaultConfig = await invoke<string>("get_default_config");
        setConfigText(defaultConfig);
      } catch (err) {
        console.error("Failed to load default config:", err);
        setStatusMsg("Failed to load default configuration.");
      }
    }
    loadConfig();
  }, []);

  // Handle simulation execution and ZIP download
  const runSimulation = async (isLoop: boolean) => {
    setIsSimulating(true);
    setStatusMsg(
      `Running ${isLoop ? "Dispersion (Loop)" : "Nominal"} simulation...`,
    );

    try {
      // Invoke Rust backend
      // Tauri serializes Vec<u8> to number[] in JavaScript
      const zipBytes = await invoke<number[]>("run_simulation", {
        configContent: configText,
        isLoop: isLoop,
      });

      // Convert number array to Uint8Array
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
        setStatusMsg(`Simulation finished successfully! Saved to ${savePath}`);
      } else {
        setStatusMsg("Simulation finished. Save cancelled by user.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setStatusMsg(`Error: ${err}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Nabla Simulator
            </h1>
            <p className="text-blue-100 text-sm">
              Fast Rocket Flight Simulator
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              {isSimulating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${isSimulating ? "bg-yellow-300" : "bg-green-400"}`}
              ></span>
            </span>
            <span className="text-white text-sm font-medium">
              {isSimulating ? "Computing..." : "Idle"}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Config Editor */}
          <div className="flex-1 border-r border-gray-200 flex flex-col">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Configuration (TOML)
              </h2>
            </div>
            <textarea
              className="flex-1 w-full p-4 font-mono text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 resize-none"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              spellCheck={false}
              disabled={isSimulating}
            />
          </div>

          {/* Right Panel: Controls & Status */}
          <div className="w-80 flex flex-col bg-gray-50">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Controls</h2>

              <div className="space-y-3">
                <button
                  onClick={() => runSimulation(false)}
                  disabled={isSimulating}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Run Nominal
                </button>

                <button
                  onClick={() => runSimulation(true)}
                  disabled={isSimulating}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Run Dispersion (Loop)
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Status Log
              </h2>
              <div
                className={`flex-1 rounded-md p-3 text-sm font-mono overflow-y-auto ${
                  statusMsg.startsWith("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-gray-800 text-green-400"
                }`}
              >
                {statusMsg}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
