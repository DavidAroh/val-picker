'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/shared/Navbar';
import { Heart, Mail, Lock, User, ArrowRight, Gift } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import toast from 'react-hot-toast';

export default function SignupPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useUser();
    const inviteCode = searchParams.get('invite');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await register(
                formData.email,
                formData.password,
                formData.name,
                inviteCode || undefined
            );

            toast.success('Account created successfully!');
            router.push('/profile-setup');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/60">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <Heart className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                            <p className="text-muted-foreground">
                                Join the Secret Valentine Exchange 2026
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.name ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="Enter your name"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="you@example.com"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.password ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="At least 6 characters"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.confirmPassword ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="Re-enter password"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Invite Code Display */}
                            {inviteCode && (
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Gift className="w-4 h-4 text-primary" />
                                        <span className="text-primary font-medium">
                                            Invite code applied
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Footer Note */}
                        <p className="text-xs text-muted-foreground text-center mt-6">
                            By signing up, you agree to participate in the Secret Valentine
                            Exchange
                        </p>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/home" className="text-primary font-semibold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
