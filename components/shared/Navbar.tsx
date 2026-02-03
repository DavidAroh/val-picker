import Link from "next/link";
import { Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
    return (
        <nav className="w-full py-6 px-6 md:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-50">
            <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                <span className="font-bold text-xl tracking-tight hidden sm:block">VALENTINE EXCHANGE</span>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                </Button>
            </div>
        </nav>
    );
}
