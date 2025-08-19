"use client";

import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ModeToggle";
import { useStore } from "@/app/zustand/store";

export default function DashboardHeader({
  toggleSidebar,
  toggleMobileSidebar,
}) {
  const { user } = useStore();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      {/* Sol: Sidebar toggle (sadece md ve üstü) */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex cursor-pointer"
        >
          <PanelLeft size={20} />
        </Button>

        {/* Mobil açılır menü */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="md:hidden"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sağ: Kullanıcı, tema butonları vs. */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        {/* Örnek: Profil, tema toggle vesaire */}
        <span className="font-medium select-none">
          {user.email.split("@")[0]}
        </span>
      </div>
    </header>
  );
}
