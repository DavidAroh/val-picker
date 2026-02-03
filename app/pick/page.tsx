'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/shared/Navbar'
import { AlertCircle, Heart, Sparkles } from 'lucide-react'
import { PARTICIPANTS } from '@/lib/gift-state'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'

export default function PickPage() {
    const [selectedName, setSelectedName] = useState('')
    const [loading, setLoading] = useState(false)
    const [revealed, setRevealed] = useState<string | null>(null)
    const [error, setError] = useState('')

    const handleReveal = async () => {
        if (!selectedName) {
            setError('Please select your name first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/pick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: selectedName }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'An error occurred')
                setRevealed(null)
            } else {
                setRevealed(data.assigned)
                triggerConfetti()
            }
        } catch (err) {
            setError('Failed to connect to server')
            setRevealed(null)
        } finally {
            setLoading(false)
        }
    }

    const triggerConfetti = () => {
        const end = Date.now() + 3 * 1000
        const colors = ['#bb0000', '#ffffff']

            ; (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                })
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            })()
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
            <Navbar />
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center gap-2 mb-3"
                        >
                            <Heart className="w-8 h-8 fill-primary text-primary animate-pulse" />
                            <h1 className="text-3xl font-bold text-foreground">
                                Your Office Valentine
                            </h1>
                            <Heart className="w-8 h-8 fill-primary text-primary animate-pulse" />
                        </motion.div>
                        <p className="text-muted-foreground text-lg">
                            Discover who you're giving a gift to
                        </p>
                    </div>

                    {/* Main Card */}
                    <Card className="p-8 shadow-lg border-secondary/30 bg-card">
                        {!revealed ? (
                            <div className="space-y-6">
                                {/* Name Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-foreground">
                                        Select Your Name
                                    </label>
                                    <select
                                        value={selectedName}
                                        onChange={(e) => setSelectedName(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="" disabled>Choose your name...</option>
                                        {PARTICIPANTS.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20"
                                    >
                                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-destructive">{error}</p>
                                    </motion.div>
                                )}

                                {/* Reveal Button */}
                                <Button
                                    onClick={handleReveal}
                                    disabled={loading || !selectedName}
                                    className="w-full h-12 text-lg font-semibold"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Revealing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Reveal My Valentine
                                        </span>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-muted-foreground italic">
                                    You can only pick once. Choose wisely! 🤫
                                </p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center"
                            >
                                {/* Reveal Animation */}
                                <div className="space-y-4">
                                    <div className="text-5xl animate-bounce">💌</div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest">
                                        Your Valentine is...
                                    </p>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
                                        <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl border-2 border-primary/30">
                                            <p className="text-4xl font-bold text-primary">
                                                {revealed}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Discretion Message */}
                                <div className="space-y-3 pt-4">
                                    <p className="text-lg font-semibold text-foreground">
                                        Shhh... it's a secret! 🤫
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Don't tell anyone who you got. The surprise is in not knowing
                                        who picked you!
                                    </p>
                                </div>

                                {/* Reset Button */}
                                <Button
                                    onClick={() => {
                                        setRevealed(null)
                                        setSelectedName('')
                                        setError('')
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Start Over
                                </Button>
                            </motion.div>
                        )}
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-muted-foreground">
                            Happy Valentine's Day! 💖
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
