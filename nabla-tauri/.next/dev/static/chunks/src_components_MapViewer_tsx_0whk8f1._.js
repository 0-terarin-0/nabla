(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/MapViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$GeoJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/GeoJSON.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$LayersControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/LayersControl.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$FeatureGroup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/FeatureGroup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polygon.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tmcw$2f$togeojson$2f$dist$2f$togeojson$2e$es$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tmcw/togeojson/dist/togeojson.es.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html$2d$to$2d$image$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/html-to-image/es/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.mjs [app-client] (ecmascript) <export default as Camera>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
// Fix Leaflet's default icon path issues in React/Webpack environments
let redDotIcon;
if ("TURBOPACK compile-time truthy", 1) {
    delete __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.prototype._getIconUrl;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
    });
    redDotIcon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: "bg-transparent",
        html: `<div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [
            12,
            12
        ],
        iconAnchor: [
            6,
            6
        ]
    });
}
// Helper component to auto-adjust the map view to fit all GeoJSON layers
function MapBounds({ geoJsonData }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapBounds.useEffect": ()=>{
            if (geoJsonData.length === 0) return;
            try {
                const bounds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].latLngBounds([]);
                geoJsonData.forEach({
                    "MapBounds.useEffect": (fc)=>{
                        const layer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].geoJSON(fc);
                        bounds.extend(layer.getBounds());
                    }
                }["MapBounds.useEffect"]);
                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [
                            30,
                            30
                        ]
                    });
                }
            } catch (e) {
                console.error("Error setting map bounds", e);
            }
        }
    }["MapBounds.useEffect"], [
        geoJsonData,
        map
    ]);
    return null;
}
_s(MapBounds, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapBounds;
function MapViewer({ kmlData, launchPos, safetyArea }) {
    _s1();
    const mapContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Parse the KML strings into GeoJSON objects, grouped by phase
    // Also extract dynamic colors and wind speeds for the legend
    const { trajectoryFeatures, parachuteFeatures, allFeatures, legendData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MapViewer.useMemo": ()=>{
            const trajectory = [];
            const parachute = [];
            const all = [];
            const legendMap = new Map();
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const parser = new DOMParser();
            for (const [filename, kmlString] of Object.entries(kmlData)){
                if (!kmlString) continue;
                try {
                    const doc = parser.parseFromString(kmlString, "text/xml");
                    const converted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tmcw$2f$togeojson$2f$dist$2f$togeojson$2e$es$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["kml"])(doc);
                    const isParachute = filename.toLowerCase().includes("parachute");
                    converted.features.forEach({
                        "MapViewer.useMemo": (f)=>{
                            if (!f.properties) f.properties = {};
                            f.properties.sourceFile = filename;
                            const color = f.properties.stroke || (isParachute ? "#ff4500" : "#00bfff");
                            const name = f.properties.name || "";
                            // Extract wind speed from KML name (e.g., "Trajectory - Wind 1.0 m/s")
                            const match = name.match(/Wind\s+([\d\.]+)\s+m\/s/i);
                            if (match) {
                                const speedNum = parseFloat(match[1]);
                                const speedStr = `${match[1]} m/s`;
                                if (!legendMap.has(speedNum)) {
                                    legendMap.set(speedNum, {
                                        speedNum,
                                        speedStr,
                                        trajColor: "#cccccc",
                                        paraColor: "#cccccc"
                                    });
                                }
                                const entry = legendMap.get(speedNum);
                                if (isParachute) {
                                    entry.paraColor = color;
                                } else {
                                    entry.trajColor = color;
                                }
                            }
                        }
                    }["MapViewer.useMemo"]);
                    // Reverse the rendering order of features so low wind is drawn last (on top)
                    converted.features.reverse();
                    all.push(converted);
                    if (isParachute) {
                        parachute.push(converted);
                    } else {
                        trajectory.push(converted);
                    }
                } catch (err) {
                    console.error(`Failed to parse KML for ${filename}`, err);
                }
            }
            // Sort legend items by wind speed
            const sortedLegendData = Array.from(legendMap.values()).sort({
                "MapViewer.useMemo.sortedLegendData": (a, b)=>a.speedNum - b.speedNum
            }["MapViewer.useMemo.sortedLegendData"]);
            return {
                trajectoryFeatures: trajectory,
                parachuteFeatures: parachute,
                allFeatures: all,
                legendData: sortedLegendData
            };
        }
    }["MapViewer.useMemo"], [
        kmlData
    ]);
    const defaultCenter = [
        34.2852,
        135.09059
    ];
    // Tooltip handler
    const onEachFeature = (feature, layer)=>{
        if (feature.properties) {
            const name = feature.properties.name;
            const desc = feature.properties.description;
            if (name || desc) {
                let tooltipContent = `<div style="font-family: system-ui, -apple-system, sans-serif;">`;
                if (name) tooltipContent += `<strong style="font-size: 14px; color: #111;">${name}</strong>`;
                if (desc) tooltipContent += `<br/><span style="color: #4b5563; font-size: 12px; margin-top: 4px; display: inline-block;">${desc}</span>`;
                tooltipContent += `</div>`;
                layer.bindTooltip(tooltipContent, {
                    sticky: true
                });
            }
        }
    };
    const getStyle = (feature)=>{
        if (feature?.properties) {
            const isParachute = feature.properties.sourceFile?.includes("parachute");
            let color = feature.properties.stroke;
            // Fallback for single run (which doesn't use export_loop_kml yet)
            if (!color) {
                color = isParachute ? "#ff4500" : "#00bfff";
            }
            return {
                color: color,
                weight: feature.properties["stroke-width"] || 2,
                opacity: feature.properties["stroke-opacity"] ?? 1.0,
                fill: false
            };
        }
        return {
            color: "#22d3ee",
            weight: 2,
            fill: false
        };
    };
    const handleScreenshot = async ()=>{
        if (!mapContainerRef.current) return;
        try {
            const dataUrl = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$html$2d$to$2d$image$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toPng"](mapContainerRef.current, {
                cacheBust: true,
                filter: (node)=>{
                    if (node instanceof HTMLElement) {
                        return !node.classList.contains("no-screenshot") && !node.classList.contains("leaflet-control-zoom") && !node.classList.contains("leaflet-control-layers");
                    }
                    return true;
                }
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `nabla_map_screenshot_${new Date().getTime()}.png`;
            a.click();
        } catch (err) {
            console.error("Screenshot failed", err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full relative bg-slate-900",
        style: {
            zIndex: 0
        },
        ref: mapContainerRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-14 z-[1000] no-screenshot",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleScreenshot,
                    className: "bg-white hover:bg-slate-50 text-slate-700 w-[34px] h-[34px] rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.3)] border-[2px] border-black/10 flex items-center justify-center transition-colors",
                    title: "Save Screenshot",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/MapViewer.tsx",
                    lineNumber: 253,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MapViewer.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this),
            legendData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-6 right-6 z-[1000] bg-white/95 p-4 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-slate-800 font-sans pointer-events-auto border border-slate-200/60",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm border border-red-700"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-[15px] tracking-tight",
                                children: "Launch point"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 267,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 265,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1.5 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200",
                                children: "Traj."
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 274,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200",
                                children: "Para."
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[10px] font-bold text-left text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200",
                                children: "Wind"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this),
                            legendData.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center w-8",
                                            title: "Trajectory",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-[2px] flex-1",
                                                    style: {
                                                        backgroundColor: item.trajColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2.5 h-2.5 rounded-full",
                                                    style: {
                                                        backgroundColor: item.trajColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 293,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-[2px] flex-1",
                                                    style: {
                                                        backgroundColor: item.trajColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/MapViewer.tsx",
                                            lineNumber: 288,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center w-8",
                                            title: "Parachute",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-[2px] flex-1",
                                                    style: {
                                                        backgroundColor: item.paraColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2.5 h-2.5 rounded-full",
                                                    style: {
                                                        backgroundColor: item.paraColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-[2px] flex-1",
                                                    style: {
                                                        backgroundColor: item.paraColor
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MapViewer.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/MapViewer.tsx",
                                            lineNumber: 304,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[14px] font-medium ml-1 tabular-nums",
                                            children: item.speedStr
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MapViewer.tsx",
                                            lineNumber: 320,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, item.speedStr, true, {
                                    fileName: "[project]/src/components/MapViewer.tsx",
                                    lineNumber: 286,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MapViewer.tsx",
                lineNumber: 264,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
                center: defaultCenter,
                zoom: 13,
                className: "w-full h-full absolute inset-0",
                zoomControl: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                        attribution: "Tiles © Esri — Source: Esri",
                        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                        maxZoom: 19,
                        crossOrigin: "anonymous"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this),
                    launchPos && redDotIcon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                        position: launchPos,
                        icon: redDotIcon
                    }, void 0, false, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$LayersControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LayersControl"], {
                        position: "topright",
                        children: [
                            safetyArea && safetyArea.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$LayersControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LayersControl"].Overlay, {
                                checked: true,
                                name: "Safety Area",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"], {
                                    positions: safetyArea,
                                    pathOptions: {
                                        color: "#000000",
                                        fillColor: "#000000",
                                        fillOpacity: 0.35,
                                        weight: 2,
                                        dashArray: "5, 5"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                        direction: "top",
                                        opacity: 0.9,
                                        sticky: true,
                                        className: "font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1",
                                        children: "Safety Area"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MapViewer.tsx",
                                        lineNumber: 361,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MapViewer.tsx",
                                    lineNumber: 351,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this),
                            trajectoryFeatures.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$LayersControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LayersControl"].Overlay, {
                                checked: true,
                                name: "Trajectory Phase",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$FeatureGroup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FeatureGroup"], {
                                    children: trajectoryFeatures.map((data, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$GeoJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeoJSON"], {
                                            data: data,
                                            onEachFeature: onEachFeature,
                                            style: getStyle
                                        }, `traj-${idx}`, false, {
                                            fileName: "[project]/src/components/MapViewer.tsx",
                                            lineNumber: 377,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MapViewer.tsx",
                                    lineNumber: 375,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 374,
                                columnNumber: 13
                            }, this),
                            parachuteFeatures.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$LayersControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LayersControl"].Overlay, {
                                checked: true,
                                name: "Parachute Phase",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$FeatureGroup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FeatureGroup"], {
                                    children: parachuteFeatures.map((data, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$GeoJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeoJSON"], {
                                            data: data,
                                            onEachFeature: onEachFeature,
                                            style: getStyle
                                        }, `para-${idx}`, false, {
                                            fileName: "[project]/src/components/MapViewer.tsx",
                                            lineNumber: 392,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MapViewer.tsx",
                                    lineNumber: 390,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MapViewer.tsx",
                                lineNumber: 389,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 348,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBounds, {
                        geoJsonData: allFeatures
                    }, void 0, false, {
                        fileName: "[project]/src/components/MapViewer.tsx",
                        lineNumber: 404,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MapViewer.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MapViewer.tsx",
        lineNumber: 241,
        columnNumber: 5
    }, this);
}
_s1(MapViewer, "bpTv9mUvPGTvxHpt1gnIDqXtWjE=");
_c1 = MapViewer;
var _c, _c1;
__turbopack_context__.k.register(_c, "MapBounds");
__turbopack_context__.k.register(_c1, "MapViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MapViewer.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/MapViewer.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_MapViewer_tsx_0whk8f1._.js.map