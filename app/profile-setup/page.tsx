"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/shared/Navbar";
import { ArrowLeft, ArrowRight, Camera, Heart, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().min(20, "Tell us a bit more about yourself (min 20 chars)"),
    work: z.string().min(5, "Share what you do (min 5 chars)"),
    hobbies: z.string().min(10, "List some hobbies (min 10 chars)"),
    wishlist: z
        .array(
            z.object({
                name: z.string().min(1, "Item name is required"),
                description: z.string().optional(),
                link: z.string().optional(),
            })
        )
        .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSetupPage() {
    const { user, updateProfile, refreshUser } = useUser();
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            bio: user?.bio || "",
            work: user?.work || "",
            hobbies: user?.hobbies || "",
            wishlist: user?.wishlist?.map((w) => ({
                name: w.name,
                description: w.description || "",
                link: w.link || ""
            })) || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "wishlist",
    });

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setUploading(true);
        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("profiles")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            toast.success("Avatar uploaded!");
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        setSaving(true);
        try {
            // Update profile
            await updateProfile({
                name: data.name,
                bio: data.bio,
                work: data.work,
                hobbies: data.hobbies,
                avatar_url: avatarUrl,
                profile_complete: true,
            });

            // Save wishlist items
            if (data.wishlist && data.wishlist.length > 0) {
                // Delete existing wishlist items
                await supabase
                    .from("wishlist_items")
                    .delete()
                    .eq("user_id", user.id);

                // Insert new wishlist items
                const wishlistItems = data.wishlist.map((item, index) => ({
                    user_id: user.id,
                    name: item.name,
                    description: item.description || null,
                    link: item.link || null,
                    display_order: index,
                }));

                const { error: wishlistError } = await supabase
                    .from("wishlist_items")
                    .insert(wishlistItems);

                if (wishlistError) throw wishlistError;
            }

            await refreshUser();
            toast.success("Profile saved successfully!");
            router.push("/home");
        } catch (error: any) {
            console.error("Save profile error:", error);
            toast.error(error.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent pb-12">
            <Navbar />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/home">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-background/80"
                            aria-label="Go back to dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Profile Setup</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-10 space-y-4"
                >
                    <div className="relative inline-block group">
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-card shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-primary text-5xl">💝</div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-2 border-card hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                        />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to the Circle!</h2>
                        <p className="text-muted-foreground font-medium">
                            Customize your profile so others can know you better.
                        </p>
                    </div>
                </motion.div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Heart className="w-4 h-4 fill-current" />
                                    <label className="font-bold text-foreground">What should we call you?</label>
                                </div>
                                <Input
                                    placeholder="Your username or nickname"
                                    {...form.register("name")}
                                    className="h-12 rounded-2xl border-input bg-card px-4 py-3 text-sm shadow-sm transition-all focus:border-primary/50 font-medium"
                                    disabled={saving}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-destructive text-xs font-bold ml-1">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Heart className="w-4 h-4 fill-current" />
                                    <label className="font-bold text-foreground">About Me</label>
                                </div>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all focus:border-primary/50 font-medium"
                                    placeholder="A little bit about who you are..."
                                    {...form.register("bio")}
                                    disabled={saving}
                                />
                                {form.formState.errors.bio && (
                                    <p className="text-destructive text-xs font-bold ml-1">
                                        {form.formState.errors.bio.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Heart className="w-4 h-4 fill-current" />
                                    <label className="font-bold text-foreground">What I do (work/study)</label>
                                </div>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all focus:border-primary/50 font-medium"
                                    placeholder="Tell them about your daily hustle..."
                                    {...form.register("work")}
                                    disabled={saving}
                                />
                                {form.formState.errors.work && (
                                    <p className="text-destructive text-xs font-bold ml-1">
                                        {form.formState.errors.work.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Heart className="w-4 h-4 fill-current" />
                                    <label className="font-bold text-foreground">Hobbies & Interests</label>
                                </div>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all focus:border-primary/50 font-medium"
                                    placeholder="Coffee, books, hiking, gaming..."
                                    {...form.register("hobbies")}
                                    disabled={saving}
                                />
                                {form.formState.errors.hobbies && (
                                    <p className="text-destructive text-xs font-bold ml-1">
                                        {form.formState.errors.hobbies.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Heart className="w-4 h-4 fill-current" />
                                        <label className="font-bold text-foreground">My Wishlist</label>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] tracking-widest text-primary border-primary/20 bg-primary/5"
                                    >
                                        OPTIONAL
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-2 items-start"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    placeholder="e.g. Lavender Scented Candle"
                                                    {...form.register(`wishlist.${index}.name` as const)}
                                                    className="bg-card border-none shadow-sm"
                                                    disabled={saving}
                                                />
                                                {form.formState.errors.wishlist?.[index]?.name && (
                                                    <p className="text-destructive text-xs ml-1">
                                                        {form.formState.errors.wishlist[index]?.name?.message}
                                                    </p>
                                                )}
                                                <Input
                                                    placeholder="Paste a link to something you love..."
                                                    {...form.register(`wishlist.${index}.link` as const)}
                                                    className="bg-card/50 text-xs h-9 text-muted-foreground border-none shadow-none"
                                                    disabled={saving}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="rounded-2xl h-12 w-12 shrink-0 bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                disabled={saving}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>

                                {fields.length < 10 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        fullWidth
                                        className="border-dashed border-primary/30 text-primary hover:bg-primary/5 h-12 rounded-2xl"
                                        onClick={() => append({ name: "", description: "", link: "" })}
                                        disabled={saving}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item {fields.length > 0 && `(${fields.length}/10)`}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="pt-4 sticky bottom-8 z-10">
                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            className="h-14 text-lg shadow-xl shadow-primary/25 font-bold rounded-full"
                            disabled={saving || uploading}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    Saving Profile...
                                </span>
                            ) : (
                                <>
                                    Save Profile
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground tracking-widest flex items-center justify-center gap-2 uppercase opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Your data is private & encrypted
                    </p>
                </form>
            </main>
        </div>
    );
}
