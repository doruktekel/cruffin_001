"use client";

import Link from "next/link";
import {
  Users,
  Clock3,
  Home,
  LogOut,
  Tv2,
  Navigation,
  Undo2,
  Box,
  Folders,
  Info,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion } from "framer-motion";

import { useStore } from "@/app/zustand/store";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardSidebar({
  isOpen,
  isMobileOpen,
  onCloseMobile,
}) {
  const { userLogout, user } = useStore();
  const router = useRouter();

  const pathname = usePathname();

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await userLogout(router);
    } catch (error) {
      // console.error("Logout failed:", error);
      // Hata olsa bile force logout
      router.push("/login");
    }
  };

  const menuItems = [
    {
      icon: <Folders size={20} />,
      label: "Kategoriler",
      href: "/dashboard/categories",
    },
    {
      icon: <Box size={20} />,
      label: "Ürünler",
      href: "/dashboard/products",
    },
    {
      icon: <Tv2 size={20} />,
      label: "Sosyal Medya",
      href: "/dashboard/social",
    },
    {
      icon: <Images size={20} />,
      label: "Galeri",
      href: "/dashboard/gallery",
    },
    {
      icon: <Info size={20} />,
      label: "Hakkımızda",
      href: "/dashboard/info",
    },
    {
      icon: <Navigation size={20} />,
      label: "İletişim",
      href: "/dashboard/contact",
    },
    {
      icon: <Clock3 size={20} />,
      label: "Çalışma Saatleri",
      href: "/dashboard/hours",
    },
    { icon: <Undo2 size={20} />, label: "Siteye Dön", href: "/" },
    { icon: <LogOut size={20} />, label: "Çıkış", href: "#", action: "logout" },
  ];

  // 👇 Ekstra menüyü role göre BAŞA ekle
  if (user?.role === "admin" || user?.role === "superadmin") {
    menuItems.unshift({
      icon: <Users size={20} />,
      label: "Kullanıcılar",
      href: "/dashboard/users",
    });
  }

  menuItems.unshift({
    icon: <Home size={20} />,
    label: "Ana Sayfa",
    href: "/dashboard",
  });

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const SidebarContent = () => (
    <div
      className={cn(
        "h-full border-r shadow-sm transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {isOpen ? (
        <h1 className="text-4xl p-2 text-center tracking-wide font-family-marcellus text-amber-700 dark:text-white">
          Cruffin
        </h1>
      ) : (
        <h1 className="text-xl p-2 text-center font-family-marcellus tracking-wide text-amber-700 dark:text-white">
          Cruffin
        </h1>
      )}

      <motion.ul
        className="space-y-1 mt-2 overflow-hidden "
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;

          return (
            <motion.li key={idx} variants={itemVariants}>
              {item.action === "logout" ? (
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full gap-2 p-3 transition-all duration-300 ease-in-out hover:bg-neutral-500 hover:text-white hover:translate-x-2 cursor-pointer",
                    isOpen ? "items-center" : "justify-center"
                  )}
                >
                  {item.icon}
                  {isOpen && <span>{item.label}</span>}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex gap-2 p-2 transition-all duration-300 ease-in-out hover:bg-neutral-500 hover:text-white hover:translate-x-2",
                    isOpen ? "items-center" : "justify-center",
                    isActive &&
                      "bg-neutral-300 dark:bg-neutral-700 font-semibold text-primary border-l-4 border-primary"
                  )}
                  onClick={onCloseMobile} // Mobile'da sidebar'ı kapat
                >
                  {item.icon}
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{SidebarContent()}</div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={onCloseMobile}>
        <SheetContent side="left" className="p-0 w-64">
          {SidebarContent()}
        </SheetContent>
      </Sheet>
    </>
  );
}
