"use client";

import DashboardHeader from "@/components/dashboard/Header";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../zustand/store";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastContainer } from "react-toastify";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const { isAuth, userCheck, loading } = useStore();

  useEffect(() => {
    const check = async () => {
      await userCheck();
      setHasChecked(true);
    };
    check();
  }, [userCheck]);

  if (!hasChecked || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={50} />
      </div>
    );
  }

  if (!isAuth) {
    router.push("/login");
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen">
        {/* Sidebar - mobile responsive */}
        <DashboardSidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1">
          <DashboardHeader
            toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
          <main className="p-4 overflow-auto md:mb-12 mb-10">{children}</main>
        </div>
      </div>

      <ToastContainer />
    </ThemeProvider>
  );
}
