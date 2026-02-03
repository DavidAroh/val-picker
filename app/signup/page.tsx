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

export default function SignupPage() {
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
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

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
            console.error('Registration error:', error);
            toast.error(error.message || 'Failed to create account');
            setErrors({ email: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent selection:bg-primary/10 selection:text-primary">
            <Navbar />
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex items-center justify-center gap-2 mb-3"
                        >
                            <Heart className="w-8 h-8 fill-primary text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">
                                Join the Exchange
                            </h1>
                        </motion.div>
                        <p className="text-muted-foreground">
                            Create your account to participate in the Secret Valentine exchange
                        </p>
                        {inviteCode && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
                                <Gift className="w-4 h-4" />
                                <span>You've been invited! Code: {inviteCode}</span>
                            </div>
                        )}
                    </div>

                    {/* Signup Card */}
                    <Card className="p-8 shadow-lg border-secondary/30 bg-card">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-background border rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.name ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="Enter your full name"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-background border rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.email ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="you@example.com"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-background border rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.password ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="Min. 8 characters"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-semibold text-foreground"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-background border rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.confirmPassword ? 'border-destructive' : 'border-input'
                                            }`}
                                        placeholder="Re-enter your password"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base font-semibold"
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

                            {/* Login Link */}
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/home" className="text-primary font-semibold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </form>
                    </Card>

                    {/* Footer Note */}
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        By signing up, you agree to participate in the Secret Valentine exchange
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
