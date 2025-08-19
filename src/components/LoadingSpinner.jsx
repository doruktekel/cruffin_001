import { Loader } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn'deki classnames fonksiyonu

export function LoadingSpinner({ size }) {
  return (
    <Loader size={size} className={cn("animate-spin text-muted-foreground")} />
  );
}
