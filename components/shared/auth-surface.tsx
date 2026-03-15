"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/shared/logo";
import { useI18n } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";

export function AuthSurface({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { messages } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => {
    return z.object({
      fullName:
        mode === "signup"
          ? z.string().min(2, "Enter your name")
          : z.string().optional(),
      email: z.string().email("Enter a valid email address"),
      password: z.string().min(8, "Use at least 8 characters"),
      rememberMe: z.boolean().optional(),
    });
  }, [mode]);

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "awaiz@edge.local",
      password: "EdgeWorkspace1",
      rememberMe: true,
    },
  });
  const rememberMe = useWatch({
    control: form.control,
    name: "rememberMe",
  });

  const submit = form.handleSubmit(() => {
    router.push("/dashboard");
  });

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2.4rem] border border-border/70 bg-card shadow-[var(--shadow-lg)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#2f353a,#454b50)] p-12 text-white lg:block">
          <div className="absolute inset-0 opacity-20 premium-grid" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Logo className="[&_span:last-child]:text-white/70 [&_span:first-child]:text-white" size="lg" />
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                <ShieldCheck className="size-4" />
                Demo environment
              </div>
              <h1 className="mt-6 max-w-xl font-heading text-5xl font-black leading-tight">
                {mode === "login"
                  ? messages.auth.loginTitle
                  : messages.auth.signupTitle}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-white/74">
                {messages.auth.subtitle}
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "Board classification across the app shell",
                "Arabic and English with RTL support",
                "Executive brief and presentation mode",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-md">
            <Logo size="lg" />
            <div className="mt-8">
              <h2 className="font-heading text-3xl font-black text-foreground">
                {mode === "login" ? messages.auth.loginTitle : messages.auth.signupTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use the demo credentials below or continue directly into the workspace.
              </p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={submit}>
              {mode === "signup" ? (
                <div className="grid gap-2">
                  <Label htmlFor="fullName">{messages.auth.fullName}</Label>
                  <Input id="fullName" {...form.register("fullName")} />
                  {form.formState.errors.fullName ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="email">{messages.auth.email}</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{messages.auth.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {form.formState.errors.password ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                <Checkbox
                  checked={Boolean(rememberMe)}
                  onCheckedChange={(checked) =>
                    form.setValue("rememberMe", Boolean(checked))
                  }
                />
                {messages.auth.rememberMe}
              </label>
              <Button type="submit" size="lg" className="rounded-full">
                {mode === "login" ? messages.common.login : messages.common.signup}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => router.push("/dashboard")}
              >
                {messages.auth.demoLogin}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => router.push("/dashboard")}
              >
                {messages.common.demoWorkspace}
              </Button>
            </form>

            <div className="mt-8 text-sm text-muted-foreground">
              {mode === "login" ? "Need an account?" : "Already have access?"}{" "}
              <Link
                href={mode === "login" ? "/signup" : "/login"}
                className="font-semibold text-primary"
              >
                {mode === "login" ? "Sign up" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
