"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface BootstrapStatusResponse {
  hasInitialSync: boolean;
  bootstrapStatus: "pending" | "syncing" | "completed" | "error";
  lastAutoSyncAt: number;
  lastBootstrapError: string;
  stats: {
    courses: number;
    quizzes: number;
  };
}

export interface DashboardBootstrapContextValue {
  bootstrap: BootstrapStatusResponse | null;
  runningBootstrap: boolean;
  runBootstrap: (mode?: "initial" | "refresh") => Promise<void>;
}

export const DashboardBootstrapContext =
  createContext<DashboardBootstrapContextValue | null>(null);

export function useDashboardBootstrapContext(): DashboardBootstrapContextValue {
  const context = useContext(DashboardBootstrapContext);
  if (!context) {
    throw new Error(
      "useDashboardBootstrapContext must be used inside DashboardShell.",
    );
  }
  return context;
}

export function DashboardBootstrapProvider({
  value,
  children,
}: {
  value: DashboardBootstrapContextValue;
  children: ReactNode;
}) {
  return (
    <DashboardBootstrapContext.Provider value={value}>
      {children}
    </DashboardBootstrapContext.Provider>
  );
}
