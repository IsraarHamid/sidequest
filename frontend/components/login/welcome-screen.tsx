"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { cn } from "cn";
import { api } from "@/lib/api";

const springTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

const Notebook = ({ ownerName }: { ownerName: string | null }) => (
  <div className="relative w-[354px] max-w-full">
    <div
      aria-hidden="true"
      className="absolute -top-5 left-3 -z-10 h-[500px] w-[320px] rotate-[-1.34deg] bg-[#CCCCCC] motion-reduce:rotate-0"
    />
    <div className="relative z-10 h-[512px] w-full overflow-hidden rounded-[8px_20px_20px_8px] bg-[#416E51] shadow-[0_4px_4px_#00000040] rotate-[1.67deg] motion-reduce:rotate-0">
      <div aria-hidden="true" className="absolute inset-y-0 left-[10px] w-[11px] bg-black/[0.09]" />
      <div className="relative flex h-full flex-col justify-end gap-3 px-10 pb-[27px]">
        <p className="text-center font-sans text-[44px] leading-[1.05] font-extrabold tracking-[-0.5px] text-[#21C45D]">
          SIDE QUEST
        </p>
        <div className="flex h-[94px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-[#DDD2C0] bg-[#FBF7F0] px-4">
          <p
            aria-live="polite"
            className="flex h-[47px] w-full items-end justify-center font-hand text-[55px] leading-none text-[#4A3B2E]"
          >
            <AnimatePresence>
              {ownerName ? (
                <motion.span
                  key={ownerName}
                  initial={{ opacity: 0, transform: "translateY(6px) scale(0.96)" }}
                  animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                  transition={springTransition}
                >
                  {ownerName}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </p>
          <div className="flex w-full flex-col items-center gap-1">
            <div className="h-0.5 w-[245px] max-w-full bg-[#262626]" />
            <p className="text-center font-sans text-[16px] leading-[1.05] font-light tracking-[-0.5px] text-black">
              This book belongs to
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const btnBase =
  "flex h-12 w-full items-center justify-center rounded-full font-sans font-semibold outline-none transition-[transform,box-shadow] duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] active:scale-[0.97] disabled:opacity-60";

const inputCls =
  "h-12 w-full rounded-2xl border border-[#DDD2C0] bg-[#FBF7F0] px-4 font-sans text-[15px] text-[#4A3B2E] outline-none placeholder:text-[#B7AA97] focus:border-[#4A3B2E]";

export const WelcomeScreen = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Landing on the welcome screen clears any existing session (this is also the
  // "log out" destination), so you always start signed out here.
  useEffect(() => {
    api.logout();
  }, []);

  async function finish(displayName: string) {
    setSignedInName(displayName);
    setTimeout(() => router.push("/"), 650);
  }

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const user = await api.googleSignIn(); // currently 501
      await finish(user.display_name);
    } catch {
      setInfo("Google sign-in is still in development — use email below (admin override available).");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user =
        mode === "register"
          ? await api.register(name.trim() || "Traveller", email.trim(), password)
          : await api.login(email.trim(), password);
      await finish(user.display_name);
    } catch (e) {
      setError(
        e instanceof Error && /409/.test(e.message)
          ? "That email is already registered — sign in instead."
          : mode === "register"
            ? "Could not create the account."
            : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#F2F2ED]">
        <div className="flex w-full max-w-[430px] flex-col items-center justify-center gap-[26px] px-5 py-8">
          <div className="login-rise">
            <Notebook ownerName={signedInName} />
          </div>

          {!signedInName && (
            <div className="flex w-[300px] max-w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className={cn(btnBase, "border border-[#747775] bg-white px-8 text-[15px] font-medium tracking-[0.25px] text-[#1F1F1F]")}
              >
                Continue with Google
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[#DDD2C0]" />
                <span className="font-sans text-[12px] text-[#8A7A69]">or</span>
                <div className="h-px flex-1 bg-[#DDD2C0]" />
              </div>

              {mode === "register" && (
                <input
                  className={inputCls}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <input
                className={inputCls}
                type="email"
                autoCapitalize="none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className={inputCls}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              {error && <p className="font-sans text-[13px] text-[#D0392F]">{error}</p>}
              {info && <p className="font-sans text-[13px] text-[#8A7A69]">{info}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={cn(btnBase, "bg-[#121212] px-8 text-[15px] text-[#FBF7F0]")}
              >
                {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "register" ? "signin" : "register");
                  setError(null);
                  setInfo(null);
                }}
                className="font-sans text-[13px] text-[#8A7A69] underline underline-offset-2"
              >
                {mode === "register" ? "Have an account? Sign in" : "New here? Create an account"}
              </button>

              <p className="mt-1 text-center font-sans text-[11px] leading-[16px] text-[#B7AA97]">
                Admin override (Google in dev): betterbash@gmail.com / betterbash
              </p>
            </div>
          )}
        </div>
      </main>
    </MotionConfig>
  );
};
