import { Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full py-12 px-6 border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex items-center gap-4 opacity-70">
                    <Heart className="w-5 h-5 fill-current text-primary animate-pulse" />
                    <Heart className="w-6 h-6 fill-current text-primary/40" />
                    <Heart className="w-5 h-5 fill-current text-primary" />
                </div>
                <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    © {new Date().getFullYear()} Valentine Picker • Spreading Joy
                </p>
            </div>
        </footer>
    );
}
