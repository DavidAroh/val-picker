"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, UserPlus } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-12 md:py-20 gap-16 md:gap-24">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider mb-2 text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-default">
              <Calendar className="w-3.5 h-3.5 mr-2" />
              Registration Open
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[0.9]"
          >
            Ready for your <br />
            <span className="text-primary mt-2 inline-block">Secret Valentine?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground/80 max-w-xl mx-auto leading-relaxed font-medium"
          >
            Join the exchange today! We'll shuffle names on Valentine's Day for a romantic surprise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-lg space-y-4"
          >
            <Button
              size="lg"
              fullWidth
              className="h-16 text-lg font-bold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/signup" className="flex items-center w-full justify-center">
                Join the Exchange
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="w-full max-w-5xl pt-10 pb-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {[
              { icon: UserPlus, title: "Sign up now", desc: "Secure your spot in the gifting circle by entering your details or group code." },
              { icon: Calendar, title: "Wait for Picking Day", desc: "Keep an eye on the timer! We'll send you a notification when the shuffle happens." },
              { icon: Sparkles, title: "Return on Feb 14th", desc: "Head back here on Valentine's Day to draw your secret name and start gifting." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.8,
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-24 h-24 rounded-full bg-card shadow-lg flex items-center justify-center mb-8 text-primary ring-8 ring-secondary/50 group-hover:scale-110 group-hover:ring-secondary/80 transition-all duration-300"
                >
                  <step.icon className="w-10 h-10" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
