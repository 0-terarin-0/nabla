(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/nabla/nabla-tauri/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$dialog$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/plugin-dialog/dist-js/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Home() {
    _s();
    const [configText, setConfigText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isSimulating, setIsSimulating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusMsg, setStatusMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Ready.");
    // Fetch default configuration from Rust backend on load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            async function loadConfig() {
                try {
                    const defaultConfig = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])("get_default_config");
                    setConfigText(defaultConfig);
                } catch (err) {
                    console.error("Failed to load default config:", err);
                    setStatusMsg("Failed to load default configuration.");
                }
            }
            loadConfig();
        }
    }["Home.useEffect"], []);
    // Handle simulation execution and ZIP download
    const runSimulation = async (isLoop)=>{
        setIsSimulating(true);
        setStatusMsg(`Running ${isLoop ? "Dispersion (Loop)" : "Nominal"} simulation...`);
        try {
            // Invoke Rust backend
            // Tauri serializes Vec<u8> to number[] in JavaScript
            const zipBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])("run_simulation", {
                configContent: configText,
                isLoop: isLoop
            });
            // Convert number array to Uint8Array
            const uint8Array = Uint8Array.from(zipBytes);
            // Prompt user to select a save location
            const savePath = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$dialog$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["save"])({
                filters: [
                    {
                        name: "ZIP Archive",
                        extensions: [
                            "zip"
                        ]
                    }
                ],
                defaultPath: isLoop ? "dispersion_results.zip" : "nominal_results.zip"
            });
            if (savePath) {
                // Write the file to the selected path
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeFile"])(savePath, uint8Array);
                setStatusMsg(`Simulation finished successfully! Saved to ${savePath}`);
            } else {
                setStatusMsg("Simulation finished. Save cancelled by user.");
            }
        } catch (err) {
            console.error("Simulation error:", err);
            setStatusMsg(`Error: ${err}`);
        } finally{
            setIsSimulating(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[85vh]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-blue-600 px-6 py-4 flex justify-between items-center shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-white tracking-tight",
                                    children: "Nabla Simulator"
                                }, void 0, false, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-blue-100 text-sm",
                                    children: "Fast Rocket Flight Simulator"
                                }, void 0, false, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "relative flex h-3 w-3",
                                    children: [
                                        isSimulating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"
                                        }, void 0, false, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `relative inline-flex rounded-full h-3 w-3 ${isSimulating ? "bg-yellow-300" : "bg-green-400"}`
                                        }, void 0, false, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-white text-sm font-medium",
                                    children: isSimulating ? "Computing..." : "Idle"
                                }, void 0, false, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-1 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 border-r border-gray-200 flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-100 px-4 py-2 border-b border-gray-200 shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-bold text-gray-700 uppercase tracking-wider",
                                        children: "Configuration (TOML)"
                                    }, void 0, false, {
                                        fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "flex-1 w-full p-4 font-mono text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 resize-none",
                                    value: configText,
                                    onChange: (e)=>setConfigText(e.target.value),
                                    spellCheck: false,
                                    disabled: isSimulating
                                }, void 0, false, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-80 flex flex-col bg-gray-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 border-b border-gray-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-bold text-gray-800 mb-4",
                                            children: "Controls"
                                        }, void 0, false, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>runSimulation(false),
                                                    disabled: isSimulating,
                                                    className: "w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                                    children: "Run Nominal"
                                                }, void 0, false, {
                                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>runSimulation(true),
                                                    disabled: isSimulating,
                                                    className: "w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                                    children: "Run Dispersion (Loop)"
                                                }, void 0, false, {
                                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 122,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 flex-1 flex flex-col",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-sm font-bold text-gray-700 uppercase tracking-wider mb-2",
                                            children: "Status Log"
                                        }, void 0, false, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex-1 rounded-md p-3 text-sm font-mono overflow-y-auto ${statusMsg.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-gray-800 text-green-400"}`,
                                            children: statusMsg
                                        }, void 0, false, {
                                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                            lineNumber: 145,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/nabla/nabla-tauri/src/app/page.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_s(Home, "++ZIbdnRZQyBYs+PYhuPmWT7nGE=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/nabla/nabla-tauri/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__classPrivateFieldGet",
    ()=>__classPrivateFieldGet,
    "__classPrivateFieldSet",
    ()=>__classPrivateFieldSet
]);
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
;
}),
"[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Channel",
    ()=>Channel,
    "PluginListener",
    ()=>PluginListener,
    "Resource",
    ()=>Resource,
    "SERIALIZE_TO_IPC_FN",
    ()=>SERIALIZE_TO_IPC_FN,
    "addPluginListener",
    ()=>addPluginListener,
    "checkPermissions",
    ()=>checkPermissions,
    "convertFileSrc",
    ()=>convertFileSrc,
    "invoke",
    ()=>invoke,
    "isTauri",
    ()=>isTauri,
    "requestPermissions",
    ()=>requestPermissions,
    "transformCallback",
    ()=>transformCallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js [app-client] (ecmascript)");
;
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
var _Channel_onmessage, _Channel_nextMessageIndex, _Channel_pendingMessages, _Channel_messageEndIndex, _Resource_rid;
/**
 * Invoke your custom commands.
 *
 * This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 * @module
 */ /**
 * A key to be used to implement a special function
 * on your types that define how your type should be serialized
 * when passing across the IPC.
 * @example
 * Given a type in Rust that looks like this
 * ```rs
 * #[derive(serde::Serialize, serde::Deserialize)
 * enum UserId {
 *   String(String),
 *   Number(u32),
 * }
 * ```
 * `UserId::String("id")` would be serialized into `{ String: "id" }`
 * and so we need to pass the same structure back to Rust
 * ```ts
 * import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
 *
 * class UserIdString {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { String: this.id }
 *   }
 * }
 *
 * class UserIdNumber {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { Number: this.id }
 *   }
 * }
 *
 * type UserId = UserIdString | UserIdNumber
 * ```
 *
 */ // if this value changes, make sure to update it in:
// 1. ipc.js
// 2. process-ipc-message-fn.js
const SERIALIZE_TO_IPC_FN = '__TAURI_TO_IPC_KEY__';
/**
 * Stores the callback in a known location, and returns an identifier that can be passed to the backend.
 * The backend uses the identifier to `eval()` the callback.
 *
 * @return An unique identifier associated with the callback function.
 *
 * @since 1.0.0
 */ function transformCallback(// TODO: Make this not optional in v3
callback, once = false) {
    return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
class Channel {
    constructor(onmessage){
        _Channel_onmessage.set(this, void 0);
        // the index is used as a mechanism to preserve message order
        _Channel_nextMessageIndex.set(this, 0);
        _Channel_pendingMessages.set(this, []);
        _Channel_messageEndIndex.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_onmessage, onmessage || (()=>{}), "f");
        this.id = transformCallback((rawMessage)=>{
            const index = rawMessage.index;
            if ('end' in rawMessage) {
                if (index == (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")) {
                    this.cleanupCallback();
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_messageEndIndex, index, "f");
                }
                return;
            }
            const message = rawMessage.message;
            // Process the message if we're at the right order
            if (index == (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f").call(this, message);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_nextMessageIndex, (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") + 1, "f");
                // process pending messages
                while((0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") in (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")){
                    const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[(0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f").call(this, message);
                    // eslint-disable-next-line @typescript-eslint/no-array-delete
                    delete (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[(0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_nextMessageIndex, (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") + 1, "f");
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") === (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_messageEndIndex, "f")) {
                    this.cleanupCallback();
                }
            } else {
                // eslint-disable-next-line security/detect-object-injection
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[index] = message;
            }
        });
    }
    cleanupCallback() {
        window.__TAURI_INTERNALS__.unregisterCallback(this.id);
    }
    set onmessage(handler) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_onmessage, handler, "f");
    }
    get onmessage() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f");
    }
    [(_Channel_onmessage = new WeakMap(), _Channel_nextMessageIndex = new WeakMap(), _Channel_pendingMessages = new WeakMap(), _Channel_messageEndIndex = new WeakMap(), SERIALIZE_TO_IPC_FN)]() {
        return `__CHANNEL__:${this.id}`;
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
class PluginListener {
    constructor(plugin, event, channelId){
        this.plugin = plugin;
        this.event = event;
        this.channelId = channelId;
    }
    async unregister() {
        return invoke(`plugin:${this.plugin}|remove_listener`, {
            event: this.event,
            channelId: this.channelId
        });
    }
}
/**
 * Adds a listener to a plugin event.
 *
 * @returns The listener object to stop listening to the events.
 *
 * @since 2.0.0
 */ async function addPluginListener(plugin, event, cb) {
    const handler = new Channel(cb);
    try {
        await invoke(`plugin:${plugin}|register_listener`, {
            event,
            handler
        });
        return new PluginListener(plugin, event, handler.id);
    } catch  {
        // TODO(v3): remove this fallback
        // note: we must try with camelCase here for backwards compatibility
        await invoke(`plugin:${plugin}|registerListener`, {
            event,
            handler
        });
        return new PluginListener(plugin, event, handler.id);
    }
}
/**
 * Get permission state for a plugin.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */ async function checkPermissions(plugin) {
    return invoke(`plugin:${plugin}|check_permissions`);
}
/**
 * Request permissions.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */ async function requestPermissions(plugin) {
    return invoke(`plugin:${plugin}|request_permissions`);
}
/**
 * Sends a message to the backend.
 * @example
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
 * ```
 *
 * @param cmd The command name.
 * @param args The optional arguments to pass to the command.
 * @param options The request options.
 * @return A promise resolving or rejecting to the backend response.
 *
 * @since 1.0.0
 */ async function invoke(cmd, args = {}, options) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
/**
 * Convert a device file path to an URL that can be loaded by the webview.
 * Note that `asset:` and `http://asset.localhost` must be added to [`app.security.csp`](https://v2.tauri.app/reference/config/#csp-1) in `tauri.conf.json`.
 * Example CSP value: `"csp": "default-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost"` to use the asset protocol on image sources.
 *
 * Additionally, `"enable" : "true"` must be added to [`app.security.assetProtocol`](https://v2.tauri.app/reference/config/#assetprotocolconfig)
 * in `tauri.conf.json` and its access scope must be defined on the `scope` array on the same `assetProtocol` object.
 *
 * @param  filePath The file path.
 * @param  protocol The protocol to use. Defaults to `asset`. You only need to set this when using a custom protocol.
 * @example
 * ```typescript
 * import { appDataDir, join } from '@tauri-apps/api/path';
 * import { convertFileSrc } from '@tauri-apps/api/core';
 * const appDataDirPath = await appDataDir();
 * const filePath = await join(appDataDirPath, 'assets/video.mp4');
 * const assetUrl = convertFileSrc(filePath);
 *
 * const video = document.getElementById('my-video');
 * const source = document.createElement('source');
 * source.type = 'video/mp4';
 * source.src = assetUrl;
 * video.appendChild(source);
 * video.load();
 * ```
 *
 * @return the URL that can be used as source on the webview.
 *
 * @since 1.0.0
 */ function convertFileSrc(filePath, protocol = 'asset') {
    return window.__TAURI_INTERNALS__.convertFileSrc(filePath, protocol);
}
/**
 * A rust-backed resource stored through `tauri::Manager::resources_table` API.
 *
 * The resource lives in the main process and does not exist
 * in the Javascript world, and thus will not be cleaned up automatically
 * except on application exit. If you want to clean it up early, call {@linkcode Resource.close}
 *
 * @example
 * ```typescript
 * import { Resource, invoke } from '@tauri-apps/api/core';
 * export class DatabaseHandle extends Resource {
 *   static async open(path: string): Promise<DatabaseHandle> {
 *     const rid: number = await invoke('open_db', { path });
 *     return new DatabaseHandle(rid);
 *   }
 *
 *   async execute(sql: string): Promise<void> {
 *     await invoke('execute_sql', { rid: this.rid, sql });
 *   }
 * }
 * ```
 */ class Resource {
    get rid() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Resource_rid, "f");
    }
    constructor(rid){
        _Resource_rid.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Resource_rid, rid, "f");
    }
    /**
     * Destroys and cleans up this resource from memory.
     * **You should not call any method on this object anymore and should drop any reference to it.**
     */ async close() {
        return invoke('plugin:resources|close', {
            rid: this.rid
        });
    }
}
_Resource_rid = new WeakMap();
function isTauri() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return !!(globalThis || window).isTauri;
}
;
}),
"[project]/nabla/nabla-tauri/node_modules/@tauri-apps/plugin-dialog/dist-js/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ask",
    ()=>ask,
    "confirm",
    ()=>confirm,
    "message",
    ()=>message,
    "open",
    ()=>open,
    "save",
    ()=>save
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Internal function to convert the buttons to the Rust type.
 */ function buttonsToRust(buttons) {
    if (buttons === undefined) {
        return undefined;
    }
    if (typeof buttons === 'string') {
        return buttons;
    } else if ('ok' in buttons && 'cancel' in buttons) {
        return {
            OkCancelCustom: [
                buttons.ok,
                buttons.cancel
            ]
        };
    } else if ('yes' in buttons && 'no' in buttons && 'cancel' in buttons) {
        return {
            YesNoCancelCustom: [
                buttons.yes,
                buttons.no,
                buttons.cancel
            ]
        };
    } else if ('ok' in buttons) {
        return {
            OkCustom: buttons.ok
        };
    }
    return undefined;
}
/**
 * Open a file/directory selection dialog.
 *
 * The selected paths are added to the filesystem and asset protocol scopes.
 * When security is more important than the easy of use of this API,
 * prefer writing a dedicated command instead.
 *
 * Note that the scope change is not persisted, so the values are cleared when the application is restarted.
 * You can save it to the filesystem using [tauri-plugin-persisted-scope](https://github.com/tauri-apps/tauri-plugin-persisted-scope).
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/plugin-dialog';
 * // Open a selection dialog for image files
 * const selected = await open({
 *   multiple: true,
 *   filters: [{
 *     name: 'Image',
 *     extensions: ['png', 'jpeg']
 *   }]
 * });
 * if (Array.isArray(selected)) {
 *   // user selected multiple files
 * } else if (selected === null) {
 *   // user cancelled the selection
 * } else {
 *   // user selected a single file
 * }
 * ```
 *
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/plugin-dialog';
 * import { appDir } from '@tauri-apps/api/path';
 * // Open a selection dialog for directories
 * const selected = await open({
 *   directory: true,
 *   multiple: true,
 *   defaultPath: await appDir(),
 * });
 * if (Array.isArray(selected)) {
 *   // user selected multiple directories
 * } else if (selected === null) {
 *   // user cancelled the selection
 * } else {
 *   // user selected a single directory
 * }
 * ```
 *
 * @returns A promise resolving to the selected path(s)
 *
 * @since 2.0.0
 */ async function open(options = {}) {
    if (typeof options === 'object') {
        Object.freeze(options);
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:dialog|open', {
        options
    });
}
/**
 * Open a file/directory save dialog.
 *
 * The selected path is added to the filesystem and asset protocol scopes.
 * When security is more important than the easy of use of this API,
 * prefer writing a dedicated command instead.
 *
 * Note that the scope change is not persisted, so the values are cleared when the application is restarted.
 * You can save it to the filesystem using [tauri-plugin-persisted-scope](https://github.com/tauri-apps/tauri-plugin-persisted-scope).
 * @example
 * ```typescript
 * import { save } from '@tauri-apps/plugin-dialog';
 * const filePath = await save({
 *   filters: [{
 *     name: 'Image',
 *     extensions: ['png', 'jpeg']
 *   }]
 * });
 * ```
 *
 * @returns A promise resolving to the selected path.
 *
 * @since 2.0.0
 */ async function save(options = {}) {
    if (typeof options === 'object') {
        Object.freeze(options);
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:dialog|save', {
        options
    });
}
async function messageCommand(message, options) {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:dialog|message', {
        message,
        title: options?.title,
        kind: options?.kind,
        buttons: buttonsToRust(options?.buttons)
    });
}
/**
 * Shows a message dialog with an `Ok` button.
 * @example
 * ```typescript
 * import { message } from '@tauri-apps/plugin-dialog';
 * await message('Tauri is awesome', 'Tauri');
 * await message('File not found', { title: 'Tauri', kind: 'error' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 *
 */ async function message(message, options) {
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    if (opts && !opts.buttons && opts.okLabel) {
        opts.buttons = {
            ok: opts.okLabel
        };
    }
    return messageCommand(message, opts);
}
/**
 * Shows a question dialog with `Yes` and `No` buttons.
 *
 * Convenient wrapper for `await message('msg', { buttons: 'YesNo' }) === 'Yes'`
 *
 * @example
 * ```typescript
 * import { ask } from '@tauri-apps/plugin-dialog';
 * const yes = await ask('Are you sure?', 'Tauri');
 * const yes2 = await ask('This action cannot be reverted. Are you sure?', { title: 'Tauri', kind: 'warning' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise resolving to a boolean indicating whether `Yes` was clicked or not.
 *
 * @since 2.0.0
 */ async function ask(message, options) {
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    const customButtons = opts?.okLabel || opts?.cancelLabel;
    const okLabel = opts?.okLabel ?? 'Yes';
    return await messageCommand(message, {
        title: opts?.title,
        kind: opts?.kind,
        buttons: customButtons ? {
            ok: okLabel,
            cancel: opts.cancelLabel ?? 'No'
        } : 'YesNo'
    }) === okLabel;
}
/**
 * Shows a question dialog with `Ok` and `Cancel` buttons.
 *
 * Convenient wrapper for `await message('msg', { buttons: 'OkCancel' }) === 'Ok'`
 *
 * @example
 * ```typescript
 * import { confirm } from '@tauri-apps/plugin-dialog';
 * const confirmed = await confirm('Are you sure?', 'Tauri');
 * const confirmed2 = await confirm('This action cannot be reverted. Are you sure?', { title: 'Tauri', kind: 'warning' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise resolving to a boolean indicating whether `Ok` was clicked or not.
 *
 * @since 2.0.0
 */ async function confirm(message, options) {
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    const customButtons = opts?.okLabel || opts?.cancelLabel;
    const okLabel = opts?.okLabel ?? 'Ok';
    return await messageCommand(message, {
        title: opts?.title,
        kind: opts?.kind,
        buttons: customButtons ? {
            ok: okLabel,
            cancel: opts.cancelLabel ?? 'Cancel'
        } : 'OkCancel'
    }) === okLabel;
}
;
}),
"[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/path.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseDirectory",
    ()=>BaseDirectory,
    "appCacheDir",
    ()=>appCacheDir,
    "appConfigDir",
    ()=>appConfigDir,
    "appDataDir",
    ()=>appDataDir,
    "appLocalDataDir",
    ()=>appLocalDataDir,
    "appLogDir",
    ()=>appLogDir,
    "audioDir",
    ()=>audioDir,
    "basename",
    ()=>basename,
    "cacheDir",
    ()=>cacheDir,
    "configDir",
    ()=>configDir,
    "dataDir",
    ()=>dataDir,
    "delimiter",
    ()=>delimiter,
    "desktopDir",
    ()=>desktopDir,
    "dirname",
    ()=>dirname,
    "documentDir",
    ()=>documentDir,
    "downloadDir",
    ()=>downloadDir,
    "executableDir",
    ()=>executableDir,
    "extname",
    ()=>extname,
    "fontDir",
    ()=>fontDir,
    "homeDir",
    ()=>homeDir,
    "isAbsolute",
    ()=>isAbsolute,
    "join",
    ()=>join,
    "localDataDir",
    ()=>localDataDir,
    "normalize",
    ()=>normalize,
    "pictureDir",
    ()=>pictureDir,
    "publicDir",
    ()=>publicDir,
    "resolve",
    ()=>resolve,
    "resolveResource",
    ()=>resolveResource,
    "resourceDir",
    ()=>resourceDir,
    "runtimeDir",
    ()=>runtimeDir,
    "sep",
    ()=>sep,
    "tempDir",
    ()=>tempDir,
    "templateDir",
    ()=>templateDir,
    "videoDir",
    ()=>videoDir
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * The path module provides utilities for working with file and directory paths.
 *
 * This package is also accessible with `window.__TAURI__.path` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 *
 * It is recommended to allowlist only the APIs you use for optimal bundle size and security.
 * @module
 */ /**
 * @since 2.0.0
 */ var BaseDirectory;
(function(BaseDirectory) {
    /**
     * @see {@link audioDir} for more information.
     */ BaseDirectory[BaseDirectory["Audio"] = 1] = "Audio";
    /**
     * @see {@link cacheDir} for more information.
     */ BaseDirectory[BaseDirectory["Cache"] = 2] = "Cache";
    /**
     * @see {@link configDir} for more information.
     */ BaseDirectory[BaseDirectory["Config"] = 3] = "Config";
    /**
     * @see {@link dataDir} for more information.
     */ BaseDirectory[BaseDirectory["Data"] = 4] = "Data";
    /**
     * @see {@link localDataDir} for more information.
     */ BaseDirectory[BaseDirectory["LocalData"] = 5] = "LocalData";
    /**
     * @see {@link documentDir} for more information.
     */ BaseDirectory[BaseDirectory["Document"] = 6] = "Document";
    /**
     * @see {@link downloadDir} for more information.
     */ BaseDirectory[BaseDirectory["Download"] = 7] = "Download";
    /**
     * @see {@link pictureDir} for more information.
     */ BaseDirectory[BaseDirectory["Picture"] = 8] = "Picture";
    /**
     * @see {@link publicDir} for more information.
     */ BaseDirectory[BaseDirectory["Public"] = 9] = "Public";
    /**
     * @see {@link videoDir} for more information.
     */ BaseDirectory[BaseDirectory["Video"] = 10] = "Video";
    /**
     * @see {@link resourceDir} for more information.
     */ BaseDirectory[BaseDirectory["Resource"] = 11] = "Resource";
    /**
     * @see {@link tempDir} for more information.
     */ BaseDirectory[BaseDirectory["Temp"] = 12] = "Temp";
    /**
     * @see {@link appConfigDir} for more information.
     */ BaseDirectory[BaseDirectory["AppConfig"] = 13] = "AppConfig";
    /**
     * @see {@link appDataDir} for more information.
     */ BaseDirectory[BaseDirectory["AppData"] = 14] = "AppData";
    /**
     * @see {@link appLocalDataDir} for more information.
     */ BaseDirectory[BaseDirectory["AppLocalData"] = 15] = "AppLocalData";
    /**
     * @see {@link appCacheDir} for more information.
     */ BaseDirectory[BaseDirectory["AppCache"] = 16] = "AppCache";
    /**
     * @see {@link appLogDir} for more information.
     */ BaseDirectory[BaseDirectory["AppLog"] = 17] = "AppLog";
    /**
     * @see {@link desktopDir} for more information.
     */ BaseDirectory[BaseDirectory["Desktop"] = 18] = "Desktop";
    /**
     * @see {@link executableDir} for more information.
     */ BaseDirectory[BaseDirectory["Executable"] = 19] = "Executable";
    /**
     * @see {@link fontDir} for more information.
     */ BaseDirectory[BaseDirectory["Font"] = 20] = "Font";
    /**
     * @see {@link homeDir} for more information.
     */ BaseDirectory[BaseDirectory["Home"] = 21] = "Home";
    /**
     * @see {@link runtimeDir} for more information.
     */ BaseDirectory[BaseDirectory["Runtime"] = 22] = "Runtime";
    /**
     * @see {@link templateDir} for more information.
     */ BaseDirectory[BaseDirectory["Template"] = 23] = "Template";
})(BaseDirectory || (BaseDirectory = {}));
/**
 * Returns the path to the suggested directory for your app's config files.
 * Resolves to `${configDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appConfigDir } from '@tauri-apps/api/path';
 * const appConfigDirPath = await appConfigDir();
 * ```
 *
 * @since 1.2.0
 */ async function appConfigDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppConfig
    });
}
/**
 * Returns the path to the suggested directory for your app's data files.
 * Resolves to `${dataDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * ```
 *
 * @since 1.2.0
 */ async function appDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppData
    });
}
/**
 * Returns the path to the suggested directory for your app's local data files.
 * Resolves to `${localDataDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appLocalDataDir } from '@tauri-apps/api/path';
 * const appLocalDataDirPath = await appLocalDataDir();
 * ```
 *
 * @since 1.2.0
 */ async function appLocalDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppLocalData
    });
}
/**
 * Returns the path to the suggested directory for your app's cache files.
 * Resolves to `${cacheDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appCacheDir } from '@tauri-apps/api/path';
 * const appCacheDirPath = await appCacheDir();
 * ```
 *
 * @since 1.2.0
 */ async function appCacheDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppCache
    });
}
/**
 * Returns the path to the user's audio directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_MUSIC_DIR`.
 * - **macOS:** Resolves to `$HOME/Music`.
 * - **Windows:** Resolves to `{FOLDERID_Music}`.
 * @example
 * ```typescript
 * import { audioDir } from '@tauri-apps/api/path';
 * const audioDirPath = await audioDir();
 * ```
 *
 * @since 1.0.0
 */ async function audioDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Audio
    });
}
/**
 * Returns the path to the user's cache directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_CACHE_HOME` or `$HOME/.cache`.
 * - **macOS:** Resolves to `$HOME/Library/Caches`.
 * - **Windows:** Resolves to `{FOLDERID_LocalAppData}`.
 * @example
 * ```typescript
 * import { cacheDir } from '@tauri-apps/api/path';
 * const cacheDirPath = await cacheDir();
 * ```
 *
 * @since 1.0.0
 */ async function cacheDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Cache
    });
}
/**
 * Returns the path to the user's config directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_CONFIG_HOME` or `$HOME/.config`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_RoamingAppData}`.
 * @example
 * ```typescript
 * import { configDir } from '@tauri-apps/api/path';
 * const configDirPath = await configDir();
 * ```
 *
 * @since 1.0.0
 */ async function configDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Config
    });
}
/**
 * Returns the path to the user's data directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME` or `$HOME/.local/share`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_RoamingAppData}`.
 * @example
 * ```typescript
 * import { dataDir } from '@tauri-apps/api/path';
 * const dataDirPath = await dataDir();
 * ```
 *
 * @since 1.0.0
 */ async function dataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Data
    });
}
/**
 * Returns the path to the user's desktop directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DESKTOP_DIR`.
 * - **macOS:** Resolves to `$HOME/Desktop`.
 * - **Windows:** Resolves to `{FOLDERID_Desktop}`.
 * @example
 * ```typescript
 * import { desktopDir } from '@tauri-apps/api/path';
 * const desktopPath = await desktopDir();
 * ```
 *
 * @since 1.0.0
 */ async function desktopDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Desktop
    });
}
/**
 * Returns the path to the user's document directory.
 * @example
 * ```typescript
 * import { documentDir } from '@tauri-apps/api/path';
 * const documentDirPath = await documentDir();
 * ```
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DOCUMENTS_DIR`.
 * - **macOS:** Resolves to `$HOME/Documents`.
 * - **Windows:** Resolves to `{FOLDERID_Documents}`.
 *
 * @since 1.0.0
 */ async function documentDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Document
    });
}
/**
 * Returns the path to the user's download directory.
 *
 * #### Platform-specific
 *
 * - **Linux**: Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DOWNLOAD_DIR`.
 * - **macOS**: Resolves to `$HOME/Downloads`.
 * - **Windows**: Resolves to `{FOLDERID_Downloads}`.
 * @example
 * ```typescript
 * import { downloadDir } from '@tauri-apps/api/path';
 * const downloadDirPath = await downloadDir();
 * ```
 *
 * @since 1.0.0
 */ async function downloadDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Download
    });
}
/**
 * Returns the path to the user's executable directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_BIN_HOME/../bin` or `$XDG_DATA_HOME/../bin` or `$HOME/.local/bin`.
 * - **macOS:** Not supported.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { executableDir } from '@tauri-apps/api/path';
 * const executableDirPath = await executableDir();
 * ```
 *
 * @since 1.0.0
 */ async function executableDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Executable
    });
}
/**
 * Returns the path to the user's font directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME/fonts` or `$HOME/.local/share/fonts`.
 * - **macOS:** Resolves to `$HOME/Library/Fonts`.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { fontDir } from '@tauri-apps/api/path';
 * const fontDirPath = await fontDir();
 * ```
 *
 * @since 1.0.0
 */ async function fontDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Font
    });
}
/**
 * Returns the path to the user's home directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$HOME`.
 * - **macOS:** Resolves to `$HOME`.
 * - **Windows:** Resolves to `{FOLDERID_Profile}`.
 * @example
 * ```typescript
 * import { homeDir } from '@tauri-apps/api/path';
 * const homeDirPath = await homeDir();
 * ```
 *
 * @since 1.0.0
 */ async function homeDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Home
    });
}
/**
 * Returns the path to the user's local data directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME` or `$HOME/.local/share`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_LocalAppData}`.
 * @example
 * ```typescript
 * import { localDataDir } from '@tauri-apps/api/path';
 * const localDataDirPath = await localDataDir();
 * ```
 *
 * @since 1.0.0
 */ async function localDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.LocalData
    });
}
/**
 * Returns the path to the user's picture directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_PICTURES_DIR`.
 * - **macOS:** Resolves to `$HOME/Pictures`.
 * - **Windows:** Resolves to `{FOLDERID_Pictures}`.
 * @example
 * ```typescript
 * import { pictureDir } from '@tauri-apps/api/path';
 * const pictureDirPath = await pictureDir();
 * ```
 *
 * @since 1.0.0
 */ async function pictureDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Picture
    });
}
/**
 * Returns the path to the user's public directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_PUBLICSHARE_DIR`.
 * - **macOS:** Resolves to `$HOME/Public`.
 * - **Windows:** Resolves to `{FOLDERID_Public}`.
 * @example
 * ```typescript
 * import { publicDir } from '@tauri-apps/api/path';
 * const publicDirPath = await publicDir();
 * ```
 *
 * @since 1.0.0
 */ async function publicDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Public
    });
}
/**
 * Returns the path to the application's resource directory.
 * To resolve a resource path, see {@linkcode resolveResource}.
 *
 * ## Platform-specific
 *
 * Although we provide the exact path where this function resolves to,
 * this is not a contract and things might change in the future
 *
 * - **Windows:** Resolves to the directory that contains the main executable.
 * - **Linux:** When running in an AppImage, the `APPDIR` variable will be set to
 *   the mounted location of the app, and the resource dir will be `${APPDIR}/usr/lib/${exe_name}`.
 *   If not running in an AppImage, the path is `/usr/lib/${exe_name}`.
 *   When running the app from `src-tauri/target/(debug|release)/`, the path is `${exe_dir}/../lib/${exe_name}`.
 * - **macOS:** Resolves to `${exe_dir}/../Resources` (inside .app).
 * - **iOS:** Resolves to `${exe_dir}/assets`.
 * - **Android:** Currently the resources are stored in the APK as assets so it's not a normal file system path,
 *   we return a special URI prefix `asset://localhost/` here that can be used with the [file system plugin](https://tauri.app/plugin/file-system/),
 *
 * @example
 * ```typescript
 * import { resourceDir } from '@tauri-apps/api/path';
 * const resourceDirPath = await resourceDir();
 * ```
 *
 * @since 1.0.0
 */ async function resourceDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Resource
    });
}
/**
 * Resolve the path to a resource file.
 * @example
 * ```typescript
 * import { resolveResource } from '@tauri-apps/api/path';
 * const resourcePath = await resolveResource('script.sh');
 * ```
 *
 * @param resourcePath The path to the resource.
 * Must follow the same syntax as defined in `tauri.conf.json > bundle > resources`, i.e. keeping subfolders and parent dir components (`../`).
 * @returns The full path to the resource.
 *
 * @since 1.0.0
 */ async function resolveResource(resourcePath) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Resource,
        path: resourcePath
    });
}
/**
 * Returns the path to the user's runtime directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_RUNTIME_DIR`.
 * - **macOS:** Not supported.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { runtimeDir } from '@tauri-apps/api/path';
 * const runtimeDirPath = await runtimeDir();
 * ```
 *
 * @since 1.0.0
 */ async function runtimeDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Runtime
    });
}
/**
 * Returns the path to the user's template directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_TEMPLATES_DIR`.
 * - **macOS:** Not supported.
 * - **Windows:** Resolves to `{FOLDERID_Templates}`.
 * @example
 * ```typescript
 * import { templateDir } from '@tauri-apps/api/path';
 * const templateDirPath = await templateDir();
 * ```
 *
 * @since 1.0.0
 */ async function templateDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Template
    });
}
/**
 * Returns the path to the user's video directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_VIDEOS_DIR`.
 * - **macOS:** Resolves to `$HOME/Movies`.
 * - **Windows:** Resolves to `{FOLDERID_Videos}`.
 * @example
 * ```typescript
 * import { videoDir } from '@tauri-apps/api/path';
 * const videoDirPath = await videoDir();
 * ```
 *
 * @since 1.0.0
 */ async function videoDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Video
    });
}
/**
 * Returns the path to the suggested directory for your app's log files.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `${configDir}/${bundleIdentifier}/logs`.
 * - **macOS:** Resolves to `${homeDir}/Library/Logs/{bundleIdentifier}`
 * - **Windows:** Resolves to `${configDir}/${bundleIdentifier}/logs`.
 * @example
 * ```typescript
 * import { appLogDir } from '@tauri-apps/api/path';
 * const appLogDirPath = await appLogDir();
 * ```
 *
 * @since 1.2.0
 */ async function appLogDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppLog
    });
}
/**
 * Returns a temporary directory.
 * @example
 * ```typescript
 * import { tempDir } from '@tauri-apps/api/path';
 * const temp = await tempDir();
 * ```
 *
 * @since 2.0.0
 */ async function tempDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Temp
    });
}
/**
 * Returns the platform-specific path segment separator:
 * - `\` on Windows
 * - `/` on POSIX
 *
 * @since 2.0.0
 */ function sep() {
    return window.__TAURI_INTERNALS__.plugins.path.sep;
}
/**
 * Returns the platform-specific path segment delimiter:
 * - `;` on Windows
 * - `:` on POSIX
 *
 * @since 2.0.0
 */ function delimiter() {
    return window.__TAURI_INTERNALS__.plugins.path.delimiter;
}
/**
 * Resolves a sequence of `paths` or `path` segments into an absolute path.
 * @example
 * ```typescript
 * import { resolve, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await resolve(appDataDirPath, '..', 'users', 'tauri', 'avatar.png');
 * ```
 *
 * @since 1.0.0
 */ async function resolve(...paths) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve', {
        paths
    });
}
/**
 * Normalizes the given `path`, resolving `'..'` and `'.'` segments and resolve symbolic links.
 * @example
 * ```typescript
 * import { normalize, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await normalize(`${appDataDirPath}/../users/tauri/avatar.png`);
 * ```
 *
 * @since 1.0.0
 */ async function normalize(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|normalize', {
        path
    });
}
/**
 *  Joins all given `path` segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.
 * @example
 * ```typescript
 * import { join, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await join(appDataDirPath, 'users', 'tauri', 'avatar.png');
 * ```
 *
 * @since 1.0.0
 */ async function join(...paths) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|join', {
        paths
    });
}
/**
 * Returns the parent directory of a given `path`. Trailing directory separators are ignored.
 * @example
 * ```typescript
 * import { dirname } from '@tauri-apps/api/path';
 * const dir = await dirname('/path/to/somedir/');
 * assert(dir === '/path/to');
 * ```
 *
 * @since 1.0.0
 */ async function dirname(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|dirname', {
        path
    });
}
/**
 * Returns the extension of the `path`.
 * @example
 * ```typescript
 * import { extname } from '@tauri-apps/api/path';
 * const ext = await extname('/path/to/file.html');
 * assert(ext === 'html');
 * ```
 *
 * @since 1.0.0
 */ async function extname(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|extname', {
        path
    });
}
/**
 * Returns the last portion of a `path`. Trailing directory separators are ignored.
 * @example
 * ```typescript
 * import { basename } from '@tauri-apps/api/path';
 * const base = await basename('path/to/app.conf');
 * assert(base === 'app.conf');
 * ```
 * @param ext An optional file extension to be removed from the returned path.
 *
 * @since 1.0.0
 */ async function basename(path, ext) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|basename', {
        path,
        ext
    });
}
/**
 * Returns whether the path is absolute or not.
 * @example
 * ```typescript
 * import { isAbsolute } from '@tauri-apps/api/path';
 * assert(await isAbsolute('/home/tauri'));
 * ```
 *
 * @since 1.0.0
 */ async function isAbsolute(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|is_absolute', {
        path
    });
}
;
}),
"[project]/nabla/nabla-tauri/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileHandle",
    ()=>FileHandle,
    "SeekMode",
    ()=>SeekMode,
    "copyFile",
    ()=>copyFile,
    "create",
    ()=>create,
    "exists",
    ()=>exists,
    "lstat",
    ()=>lstat,
    "mkdir",
    ()=>mkdir,
    "open",
    ()=>open,
    "readDir",
    ()=>readDir,
    "readFile",
    ()=>readFile,
    "readTextFile",
    ()=>readTextFile,
    "readTextFileLines",
    ()=>readTextFileLines,
    "remove",
    ()=>remove,
    "rename",
    ()=>rename,
    "size",
    ()=>size,
    "startAccessingSecurityScopedResource",
    ()=>startAccessingSecurityScopedResource,
    "stat",
    ()=>stat,
    "stopAccessingSecurityScopedResource",
    ()=>stopAccessingSecurityScopedResource,
    "truncate",
    ()=>truncate,
    "watch",
    ()=>watch,
    "watchImmediate",
    ()=>watchImmediate,
    "writeFile",
    ()=>writeFile,
    "writeTextFile",
    ()=>writeTextFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/path.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nabla/nabla-tauri/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Access the file system.
 *
 * ## iOS security-scoped resources
 *
 * On iOS, the `fs` plugin automatically manages access to security-scoped resources when a file URL is accessed.
 * This is required for files outside the app's sandbox (e.g., from file picker).
 *
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/plugin-fs';
 *
 * const file = await open('file:///path/to/file.txt');
 * await file.close();
 * ```
 *
 * ## Security
 *
 * This module prevents path traversal, not allowing parent directory accessors to be used
 * (i.e. "/usr/path/to/../file" or "../path/to/file" paths are not allowed).
 * Paths accessed with this API must be either relative to one of the {@link BaseDirectory | base directories}
 * or created with the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/ | path API}.
 *
 * The API has a scope configuration that forces you to restrict the paths that can be accessed using glob patterns.
 *
 * The scope configuration is an array of glob patterns describing file/directory paths that are allowed.
 * For instance, this scope configuration allows **all** enabled `fs` APIs to (only) access files in the
 * *databases* directory of the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | `$APPDATA` directory}:
 * ```json
 * {
 *   "permissions": [
 *     {
 *       "identifier": "fs:scope",
 *       "allow": [{ "path": "$APPDATA/databases/*" }]
 *     }
 *   ]
 * }
 * ```
 *
 * Scopes can also be applied to specific `fs` APIs by using the API's identifier instead of `fs:scope`:
 * ```json
 * {
 *   "permissions": [
 *     {
 *       "identifier": "fs:allow-exists",
 *       "allow": [{ "path": "$APPDATA/databases/*" }]
 *     }
 *   ]
 * }
 * ```
 *
 * Notice the use of the `$APPDATA` variable. The value is injected at runtime, resolving to the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | app data directory}.
 *
 * The available variables are:
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appconfigdir | $APPCONFIG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | $APPDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#applocaldatadir | $APPLOCALDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appcachedir | $APPCACHE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#applogdir | $APPLOG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#audiodir | $AUDIO},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#cachedir | $CACHE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#configdir | $CONFIG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#datadir | $DATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#localdatadir | $LOCALDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#desktopdir | $DESKTOP},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#documentdir | $DOCUMENT},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#downloaddir | $DOWNLOAD},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#executabledir | $EXE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#fontdir | $FONT},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#homedir | $HOME},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#picturedir | $PICTURE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#publicdir | $PUBLIC},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#runtimedir | $RUNTIME},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#templatedir | $TEMPLATE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#videodir | $VIDEO},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#resourcedir | $RESOURCE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#tempdir | $TEMP}.
 *
 * Trying to execute any API with a URL not configured on the scope results in a promise rejection due to denied access.
 *
 * @module
 */ var SeekMode;
(function(SeekMode) {
    SeekMode[SeekMode["Start"] = 0] = "Start";
    SeekMode[SeekMode["Current"] = 1] = "Current";
    SeekMode[SeekMode["End"] = 2] = "End";
})(SeekMode || (SeekMode = {}));
function parseFileInfo(r) {
    return {
        isFile: r.isFile,
        isDirectory: r.isDirectory,
        isSymlink: r.isSymlink,
        size: r.size,
        mtime: r.mtime !== null ? new Date(r.mtime) : null,
        atime: r.atime !== null ? new Date(r.atime) : null,
        birthtime: r.birthtime !== null ? new Date(r.birthtime) : null,
        readonly: r.readonly,
        fileAttributes: r.fileAttributes,
        dev: r.dev,
        ino: r.ino,
        mode: r.mode,
        nlink: r.nlink,
        uid: r.uid,
        gid: r.gid,
        rdev: r.rdev,
        blksize: r.blksize,
        blocks: r.blocks
    };
}
// https://gist.github.com/zapthedingbat/38ebfbedd98396624e5b5f2ff462611d
/** Converts a big-endian eight byte array to number  */ function fromBytes(buffer) {
    const bytes = new Uint8ClampedArray(buffer);
    const size = bytes.byteLength;
    let x = 0;
    for(let i = 0; i < size; i++){
        // eslint-disable-next-line security/detect-object-injection
        const byte = bytes[i];
        x *= 0x100;
        x += byte;
    }
    return x;
}
/**
 *  The Tauri abstraction for reading and writing files.
 *
 * @since 2.0.0
 */ class FileHandle extends __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
    /**
     * Reads up to `p.byteLength` bytes into `p`. It resolves to the number of
     * bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
     * encountered. Even if `read()` resolves to `n` < `p.byteLength`, it may
     * use all of `p` as scratch space during the call. If some data is
     * available but not `p.byteLength` bytes, `read()` conventionally resolves
     * to what is available instead of waiting for more.
     *
     * When `read()` encounters end-of-file condition, it resolves to EOF
     * (`null`).
     *
     * When `read()` encounters an error, it rejects with an error.
     *
     * Callers should always process the `n` > `0` bytes returned before
     * considering the EOF (`null`). Doing so correctly handles I/O errors that
     * happen after reading some bytes and also both of the allowed EOF
     * behaviors.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from "@tauri-apps/plugin-fs"
     * // if "$APPCONFIG/foo/bar.txt" contains the text "hello world":
     * const file = await open("foo/bar.txt", { baseDir: BaseDirectory.AppConfig });
     * const buf = new Uint8Array(100);
     * const numberOfBytesRead = await file.read(buf); // 11 bytes
     * const text = new TextDecoder().decode(buf);  // "hello world"
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async read(buffer) {
        if (buffer.byteLength === 0) {
            return 0;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read', {
            rid: this.rid,
            len: buffer.byteLength
        });
        // Rust side will never return an empty array for this command and
        // ensure there is at least 8 elements there.
        //
        // This is an optimization to include the number of read bytes (as bigendian bytes)
        // at the end of returned array to avoid serialization overhead of separate values.
        const nread = fromBytes(data.slice(-8));
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        buffer.set(bytes.slice(0, bytes.length - 8));
        return nread === 0 ? null : nread;
    }
    /**
     * Seek sets the offset for the next `read()` or `write()` to offset,
     * interpreted according to `whence`: `Start` means relative to the
     * start of the file, `Current` means relative to the current offset,
     * and `End` means relative to the end. Seek resolves to the new offset
     * relative to the start of the file.
     *
     * Seeking to an offset before the start of the file is an error. Seeking to
     * any positive offset is legal, but the behavior of subsequent I/O
     * operations on the underlying object is implementation-dependent.
     * It returns the number of cursor position.
     *
     * @example
     * ```typescript
     * import { open, SeekMode, BaseDirectory } from '@tauri-apps/plugin-fs';
     *
     * // Given hello.txt pointing to file with "Hello world", which is 11 bytes long:
     * const file = await open('hello.txt', { read: true, write: true, truncate: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.write(new TextEncoder().encode("Hello world"));
     *
     * // Seek 6 bytes from the start of the file
     * console.log(await file.seek(6, SeekMode.Start)); // "6"
     * // Seek 2 more bytes from the current position
     * console.log(await file.seek(2, SeekMode.Current)); // "8"
     * // Seek backwards 2 bytes from the end of the file
     * console.log(await file.seek(-2, SeekMode.End)); // "9" (e.g. 11-2)
     *
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async seek(offset, whence) {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|seek', {
            rid: this.rid,
            offset,
            whence
        });
    }
    /**
     * Returns a {@linkcode FileInfo } for this file.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from '@tauri-apps/plugin-fs';
     * const file = await open("file.txt", { read: true, baseDir: BaseDirectory.AppLocalData });
     * const fileInfo = await file.stat();
     * console.log(fileInfo.isFile); // true
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async stat() {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|fstat', {
            rid: this.rid
        });
        return parseFileInfo(res);
    }
    /**
     * Truncates or extends this file, to reach the specified `len`.
     * If `len` is not specified then the entire file contents are truncated.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from '@tauri-apps/plugin-fs';
     *
     * // truncate the entire file
     * const file = await open("my_file.txt", { read: true, write: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.truncate();
     *
     * // truncate part of the file
     * const file = await open("my_file.txt", { read: true, write: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.write(new TextEncoder().encode("Hello World"));
     * await file.truncate(7);
     * const data = new Uint8Array(32);
     * await file.read(data);
     * console.log(new TextDecoder().decode(data)); // Hello W
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async truncate(len) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|ftruncate', {
            rid: this.rid,
            len
        });
    }
    /**
     * Writes `data.byteLength` bytes from `data` to the underlying data stream. It
     * resolves to the number of bytes written from `data` (`0` <= `n` <=
     * `data.byteLength`) or reject with the error encountered that caused the
     * write to stop early. `write()` must reject with a non-null error if
     * would resolve to `n` < `data.byteLength`. `write()` must not modify the
     * slice data, even temporarily.
     *
     * @example
     * ```typescript
     * import { open, write, BaseDirectory } from '@tauri-apps/plugin-fs';
     * const encoder = new TextEncoder();
     * const data = encoder.encode("Hello world");
     * const file = await open("bar.txt", { write: true, baseDir: BaseDirectory.AppLocalData });
     * const bytesWritten = await file.write(data); // 11
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async write(data) {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write', {
            rid: this.rid,
            data
        });
    }
}
/**
 * Creates a file if none exists or truncates an existing file and resolves to
 *  an instance of {@linkcode FileHandle }.
 *
 * @example
 * ```typescript
 * import { create, BaseDirectory } from "@tauri-apps/plugin-fs"
 * const file = await create("foo/bar.txt", { baseDir: BaseDirectory.AppConfig });
 * await file.write(new TextEncoder().encode("Hello world"));
 * await file.close();
 * ```
 *
 * @since 2.0.0
 */ async function create(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|create', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return new FileHandle(rid);
}
/**
 * Open a file and resolve to an instance of {@linkcode FileHandle}. The
 * file does not need to previously exist if using the `create` or `createNew`
 * open options. It is the callers responsibility to close the file when finished
 * with it.
 *
 * @example
 * ```typescript
 * import { open, BaseDirectory } from "@tauri-apps/plugin-fs"
 * const file = await open("foo/bar.txt", { read: true, write: true, baseDir: BaseDirectory.AppLocalData });
 * // Do work with file
 * await file.close();
 * ```
 *
 * @since 2.0.0
 */ async function open(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|open', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return new FileHandle(rid);
}
/**
 * Copies the contents and permissions of one file to another specified path, by default creating a new file if needed, else overwriting.
 * @example
 * ```typescript
 * import { copyFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await copyFile('app.conf', 'app.conf.bk', { fromPathBaseDir: BaseDirectory.AppConfig, toPathBaseDir: BaseDirectory.AppConfig });
 * ```
 *
 * @since 2.0.0
 */ async function copyFile(fromPath, toPath, options) {
    if (fromPath instanceof URL && fromPath.protocol !== 'file:' || toPath instanceof URL && toPath.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|copy_file', {
        fromPath: fromPath instanceof URL ? fromPath.toString() : fromPath,
        toPath: toPath instanceof URL ? toPath.toString() : toPath,
        options
    });
}
/**
 * Creates a new directory with the specified path.
 * @example
 * ```typescript
 * import { mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await mkdir('users', { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function mkdir(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|mkdir', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Reads the directory given by path and returns an array of `DirEntry`.
 * @example
 * ```typescript
 * import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';
 * import { join } from '@tauri-apps/api/path';
 * const dir = "users"
 * const entries = await readDir('users', { baseDir: BaseDirectory.AppLocalData });
 * processEntriesRecursively(dir, entries);
 * async function processEntriesRecursively(parent, entries) {
 *   for (const entry of entries) {
 *     console.log(`Entry: ${entry.name}`);
 *     if (entry.isDirectory) {
 *        const dir = await join(parent, entry.name);
 *       processEntriesRecursively(dir, await readDir(dir, { baseDir: BaseDirectory.AppLocalData }))
 *     }
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 */ async function readDir(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_dir', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Reads and resolves to the entire contents of a file as an array of bytes.
 * TextDecoder can be used to transform the bytes to string if required.
 * @example
 * ```typescript
 * import { readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const contents = await readFile('avatar.png', { baseDir: BaseDirectory.Resource });
 * ```
 *
 * @since 2.0.0
 */ async function readFile(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_file', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return arr instanceof ArrayBuffer ? new Uint8Array(arr) : Uint8Array.from(arr);
}
/**
 * Reads and returns the entire contents of a file as a string using the specified encoding (default: UTF-8).
 * @example
 * ```typescript
 * import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const contents = await readTextFile('app.conf', { baseDir: BaseDirectory.AppConfig });
 * ```
 *
 * @since 2.0.0
 */ async function readTextFile(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    const bytes = arr instanceof ArrayBuffer ? arr : Uint8Array.from(arr);
    return new TextDecoder(options?.encoding ?? 'utf-8').decode(bytes);
}
/**
 * Returns an async {@linkcode AsyncIterableIterator} over the lines of a file, decoded using the specified encoding (default: UTF-8).
 * @example
 * ```typescript
 * import { readTextFileLines, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const lines = await readTextFileLines('app.conf', { baseDir: BaseDirectory.AppConfig });
 * for await (const line of lines) {
 *   console.log(line);
 * }
 * ```
 * You could also call {@linkcode AsyncIterableIterator.next} to advance the
 * iterator so you can lazily read the next line whenever you want.
 *
 * @since 2.0.0
 */ async function readTextFileLines(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const pathStr = path instanceof URL ? path.toString() : path;
    return await Promise.resolve({
        path: pathStr,
        rid: null,
        async next () {
            const decoder = new TextDecoder(options?.encoding ?? 'utf-8');
            if (this.rid === null) {
                // Use the normalized encoding label for options.
                const encoding = decoder.encoding;
                this.rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file_lines', {
                    path: pathStr,
                    options: options != null ? {
                        ...options,
                        encoding
                    } : undefined
                });
            }
            const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file_lines_next', {
                rid: this.rid
            });
            const bytes = arr instanceof ArrayBuffer ? new Uint8Array(arr) : Uint8Array.from(arr);
            // Rust side will never return an empty array for this command and
            // ensure there is at least one elements there.
            //
            // This is an optimization to include whether we finished iteration or not (1 or 0)
            // at the end of returned array to avoid serialization overhead of separate values.
            const done = bytes[bytes.byteLength - 1] === 1;
            if (done) {
                // a full iteration is over, reset rid for next iteration
                this.rid = null;
                return {
                    value: null,
                    done
                };
            }
            const line = decoder.decode(bytes.slice(0, bytes.byteLength - 1));
            return {
                value: line,
                done
            };
        },
        [Symbol.asyncIterator] () {
            return this;
        }
    });
}
/**
 * Removes the named file or directory.
 * If the directory is not empty and the `recursive` option isn't set to true, the promise will be rejected.
 * @example
 * ```typescript
 * import { remove, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await remove('users/file.txt', { baseDir: BaseDirectory.AppLocalData });
 * await remove('users', { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function remove(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|remove', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Renames (moves) oldpath to newpath. Paths may be files or directories.
 * If newpath already exists and is not a directory, rename() replaces it.
 * OS-specific restrictions may apply when oldpath and newpath are in different directories.
 *
 * On Unix, this operation does not follow symlinks at either path.
 *
 * @example
 * ```typescript
 * import { rename, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await rename('avatar.png', 'deleted.png', { oldPathBaseDir: BaseDirectory.App, newPathBaseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function rename(oldPath, newPath, options) {
    if (oldPath instanceof URL && oldPath.protocol !== 'file:' || newPath instanceof URL && newPath.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|rename', {
        oldPath: oldPath instanceof URL ? oldPath.toString() : oldPath,
        newPath: newPath instanceof URL ? newPath.toString() : newPath,
        options
    });
}
/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. Will always
 * follow symlinks but will reject if the symlink points to a path outside of the scope.
 *
 * @example
 * ```typescript
 * import { stat, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const fileInfo = await stat("hello.txt", { baseDir: BaseDirectory.AppLocalData });
 * console.log(fileInfo.isFile); // true
 * ```
 *
 * @since 2.0.0
 */ async function stat(path, options) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|stat', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return parseFileInfo(res);
}
/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. If `path` is a
 * symlink, information for the symlink will be returned instead of what it
 * points to.
 *
 * @example
 * ```typescript
 * import { lstat, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const fileInfo = await lstat("hello.txt", { baseDir: BaseDirectory.AppLocalData });
 * console.log(fileInfo.isFile); // true
 * ```
 *
 * @since 2.0.0
 */ async function lstat(path, options) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|lstat', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return parseFileInfo(res);
}
/**
 * Truncates or extends the specified file, to reach the specified `len`.
 * If `len` is `0` or not specified, then the entire file contents are truncated.
 *
 * @example
 * ```typescript
 * import { truncate, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // truncate the entire file
 * await truncate("my_file.txt", 0, { baseDir: BaseDirectory.AppLocalData });
 *
 * // truncate part of the file
 * const filePath = "file.txt";
 * await writeTextFile(filePath, "Hello World", { baseDir: BaseDirectory.AppLocalData });
 * await truncate(filePath, 7, { baseDir: BaseDirectory.AppLocalData });
 * const data = await readTextFile(filePath, { baseDir: BaseDirectory.AppLocalData });
 * console.log(data);  // "Hello W"
 * ```
 *
 * @since 2.0.0
 */ async function truncate(path, len, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|truncate', {
        path: path instanceof URL ? path.toString() : path,
        len,
        options
    });
}
/**
 * Write `data` to the given `path`, by default creating a new file if needed, else overwriting.
 * @example
 * ```typescript
 * import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 *
 * let encoder = new TextEncoder();
 * let data = encoder.encode("Hello World");
 * await writeFile('file.txt', data, { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function writeFile(path, data, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    if (data instanceof ReadableStream) {
        const file = await open(path, {
            read: false,
            create: true,
            write: true,
            ...options
        });
        const reader = data.getReader();
        try {
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                await file.write(value);
            }
        } finally{
            reader.releaseLock();
            await file.close();
        }
    } else {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write_file', data, {
            headers: {
                path: encodeURIComponent(path instanceof URL ? path.toString() : path),
                options: JSON.stringify(options)
            }
        });
    }
}
/**
  * Writes UTF-8 string `data` to the given `path`, by default creating a new file if needed, else overwriting.
    @example
  * ```typescript
  * import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
  *
  * await writeTextFile('file.txt', "Hello world", { baseDir: BaseDirectory.AppLocalData });
  * ```
  *
  * @since 2.0.0
  */ async function writeTextFile(path, data, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const encoder = new TextEncoder();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write_text_file', encoder.encode(data), {
        headers: {
            path: encodeURIComponent(path instanceof URL ? path.toString() : path),
            options: JSON.stringify(options)
        }
    });
}
/**
 * Check if a path exists.
 * @example
 * ```typescript
 * import { exists, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // Check if the `$APPDATA/avatar.png` file exists
 * await exists('avatar.png', { baseDir: BaseDirectory.AppData });
 * ```
 *
 * @since 2.0.0
 */ async function exists(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|exists', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
class Watcher extends __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
}
async function watchInternal(paths, cb, options) {
    const watchPaths = Array.isArray(paths) ? paths : [
        paths
    ];
    for (const path of watchPaths){
        if (path instanceof URL && path.protocol !== 'file:') {
            throw new TypeError('Must be a file URL.');
        }
    }
    const onEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Channel"]();
    onEvent.onmessage = cb;
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|watch', {
        paths: watchPaths.map((p)=>p instanceof URL ? p.toString() : p),
        options,
        onEvent
    });
    const watcher = new Watcher(rid);
    return ()=>{
        void watcher.close();
    };
}
// TODO: Return `Watcher` instead in v3
/**
 * Watch changes (after a delay) on files or directories.
 *
 * @since 2.0.0
 */ async function watch(paths, cb, options) {
    return await watchInternal(paths, cb, {
        delayMs: 2000,
        ...options
    });
}
// TODO: Return `Watcher` instead in v3
/**
 * Watch changes on files or directories.
 *
 * @since 2.0.0
 */ async function watchImmediate(paths, cb, options) {
    return await watchInternal(paths, cb, {
        ...options,
        delayMs: undefined
    });
}
/**
 * Get the size of a file or directory. For files, the `stat` functions can be used as well.
 *
 * If `path` is a directory, this function will recursively iterate over every file and every directory inside of `path` and therefore will be very time consuming if used on larger directories.
 *
 * @example
 * ```typescript
 * import { size, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // Get the size of the `$APPDATA/tauri` directory.
 * const dirSize = await size('tauri', { baseDir: BaseDirectory.AppData });
 * console.log(dirSize); // 1024
 * ```
 *
 * @since 2.1.0
 */ async function size(path) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|size', {
        path: path instanceof URL ? path.toString() : path
    });
}
/**
 * Starts accessing a security-scoped resource for the given file URL.
 * This should be called when you're accessing a file that was opened
 * using a security-scoped URL (e.g., from a file picker).
 *
 * Note that accessing security-scoped resources is automatically managed by the plugin on iOS, so you don't need to call this function
 * unless you want to manage the scope manually.
 *
 * You must call {@linkcode stopAccessingSecurityScopedResource} when you're done accessing the resource.
 *
 * #### Platform-specific
 *
 * - **iOS:** Starts accessing the security-scoped resource.
 * - **Other platforms:** does nothing.
 *
 * @example
 * ```typescript
 * import { startAccessingSecurityScopedResource } from '@tauri-apps/plugin-fs';
 *
 * const filePath = 'file:///path/to/file.txt';
 * await startAccessingSecurityScopedResource(filePath);
 * // ... use the resource ...
 * ```
 *
 * @since 2.5.0
 */ async function startAccessingSecurityScopedResource(path) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|start_accessing_security_scoped_resource', {
        path: path instanceof URL ? path.toString() : path
    });
}
/**
 * Stops accessing a security-scoped resource for the given file URL.
 * This should be called when you're done accessing a file that was opened
 * using a security-scoped URL (e.g., from a file picker) when using manual tracking via {@linkcode startAccessingSecurityScopedResource}.
 *
 * #### Platform-specific
 *
 * - **iOS:** Stops accessing the security-scoped resource.
 * - **Other platforms:** does nothing.
 *
 * @example
 * ```typescript
 * import { stopAccessingSecurityScopedResource } from '@tauri-apps/plugin-fs';
 *
 * const filePath = 'file:///path/to/file.txt';
 * await startAccessingSecurityScopedResource(filePath);
 * // ... use the resource ...
 * // when you're done with the resource:
 * await stopAccessingSecurityScopedResource(filePath);
 * ```
 *
 * @since 2.5.0
 */ async function stopAccessingSecurityScopedResource(path) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$nabla$2f$nabla$2d$tauri$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|stop_accessing_security_scoped_resource', {
        path: path instanceof URL ? path.toString() : path
    });
}
;
}),
]);

//# sourceMappingURL=nabla_nabla-tauri_0tz_q18._.js.map