"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Zap,
  Globe,
  Map as MapIcon,
  Download,
  ChevronRight,
  GitBranch,
  Code2,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Rocket className="w-6 h-6 text-emerald-500" />
            <span>Nabla Simulator</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/0-terarin-0/nabla"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 rounded-full"
              >
                <GitBranch className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 -z-10" />

        <div className="max-w-4xl mx-auto text-center mt-12">
          <motion.div initial="initial" animate="animate" variants={fadeIn}>
            <Badge
              variant="outline"
              className="mb-6 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full text-sm"
            >
              v1.0.0 is now available
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Next-Generation <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Rocket Flight Simulator
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A high-performance 6-DOF simulator powered by Rust and Rayon.
            Experience blazingly fast Monte Carlo dispersion analysis with an
            elegant, interactive GUI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="https://run.nabla-sim.app">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8 h-14 text-lg font-medium w-full sm:w-auto group"
              >
                Try Web Version
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://github.com/0-terarin-0/nabla/releases/latest">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 text-lg font-medium border-zinc-700 hover:bg-zinc-800 text-zinc-50 w-full sm:w-auto"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Desktop App
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Powerful Features
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Built from the ground up to provide both uncompromising
              computational accuracy and an exceptional user experience.
            </p>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-400" />}
              title="Blazing Fast Execution"
              description="Ported to Rust from Python (miniQuabla). Utilizes Rayon for parallel multi-threading, calculating complex 6-DOF Monte Carlo dispersions in milliseconds."
            />
            <FeatureCard
              icon={<MapIcon className="w-8 h-8 text-blue-400" />}
              title="Interactive Flight Maps"
              description="Dynamically parse KML files onto a live satellite map. Visualize rocket trajectories and wind-based dispersion heatmaps instantly."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-emerald-400" />}
              title="Web & Desktop Support"
              description="Available anywhere. Use the zero-install Web version powered by Axum, or download the native Tauri desktop app for Windows, macOS, and Linux."
            />
            <FeatureCard
              icon={<Code2 className="w-8 h-8 text-purple-400" />}
              title="Built-in Config Editor"
              description="Edit TOML configuration files directly within the app. Instant feedback, syntax support, and seamless local file uploads."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="w-8 h-8 text-emerald-400" />}
              title="External CSV Integration"
              description="Easily inject complex time-series data like engine thrust curves or Mach-dependent aerodynamic coefficients via drag-and-drop CSV uploads."
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-pink-400" />}
              title="Modern Tech Stack"
              description="Powered by a state-of-the-art stack: Next.js (React), Tailwind CSS v4, shadcn/ui, and a Cargo Workspace for ultimate maintainability."
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to launch?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Start simulating your rocket flights with unparalleled speed and
            accuracy today.
          </p>
          <Link href="https://run.nabla-sim.app">
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-10 h-14 text-lg font-bold"
            >
              Open Simulator
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-zinc-950 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-lg text-zinc-300">
            <Rocket className="w-5 h-5 text-emerald-500" />
            <span>Nabla Simulator</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Nabla Project. Released under the MIT
            License.
          </p>
          <div className="flex gap-4">
            <Link
              href="https://github.com/0-terarin-0/nabla"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              GitHub Repository
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const item = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={item}>
      <Card className="bg-zinc-900/50 border-white/10 h-full flex flex-col hover:bg-zinc-900 transition-colors duration-300">
        <CardHeader>
          <div className="bg-zinc-800/50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-xl text-zinc-100">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-zinc-400 text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
