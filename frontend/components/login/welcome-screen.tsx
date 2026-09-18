"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Drawer } from "@base-ui/react/drawer";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "cn";
import { Wordmark } from "@/components/ui/wordmark";
import { api } from "@/lib/api";
import { JOURNAL_STICKERS } from "@/lib/journal-art";

type AuthVariant = "create" | "google" | "apple" | "email";

const springTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

const AuthButton = ({
  label,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  variant: AuthVariant;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex h-12 w-full items-center justify-center rounded-full font-sans font-semibold outline-none",
      "transition-[transform,box-shadow] duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
      "active:scale-[0.97] disabled:opacity-60",
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
      variant === "create" && "bg-[#121212] px-8 text-[15px] text-[#FBF7F0]",
      variant === "google" &&
        "border border-[#747775] bg-white px-8 text-[16px] text-[#1F1F1F]",
      variant === "apple" && "bg-black px-8 text-[16px] text-white",
      variant === "email" &&
        "border border-[#DDD2C0] bg-[#FBF7F0] px-8 text-[15px] text-[#4A3B2E]",
    )}
  >
    {label}
  </button>
);

const Notebook = ({ ownerName }: { ownerName: string | null }) => (
  <div className="relative w-[354px] max-w-full">
    <div
      aria-hidden="true"
      className="absolute top-[-3.5%] left-[2%] -z-10 h-[84.2%] w-[80.2%] rotate-[-1.34deg] bg-[#CCCCCC] motion-reduce:rotate-0"
    />
    <div className="@container relative z-10 aspect-[354/512] w-full overflow-hidden rounded-[8px_20px_20px_8px] border-t border-white/[0.45] bg-[#416E51] shadow-[0_4px_4px_#00000040] rotate-[1.67deg] motion-reduce:rotate-0">
      <Wordmark className="absolute top-[29.36%] left-[20.89%] text-[#21C45D]" />
      <div className="absolute top-[76.42%] left-[13.42%] flex h-[18.36%] w-[77.4%] flex-col items-center justify-center gap-2.5 rounded-2xl border border-[#DDD2C0] bg-[#FBF7F0] px-4">
        <p
          aria-live="polite"
          className="flex h-[47px] w-full items-end justify-center font-hand text-[15.54cqw] leading-none text-[#4A3B2E]"
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
          <div className="h-0.5 w-[89.4%] max-w-full bg-[#262626]" />
          <p className="text-center font-sans text-[4.52cqw] leading-[1.05] font-light tracking-[-0.141cqw] text-black">
            This book belongs to
          </p>
        </div>
      </div>
      {JOURNAL_STICKERS.filter((sticker) => sticker.layer === 1).map((sticker) => (
        <img
          key={sticker.id}
          src={sticker.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={sticker.className}
        />
      ))}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[2.89%] z-[2] w-[3.11%] bg-black/[0.09]"
      />
      {JOURNAL_STICKERS.filter((sticker) => sticker.layer === 3).map((sticker) => (
        <img
          key={sticker.id}
          src={sticker.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={sticker.className}
        />
      ))}
    </div>
  </div>
);

const LAST_NAME_KEY = "sidequest.lastName";

const inputCls =
  "h-12 w-full rounded-2xl border border-[#DDD2C0] bg-[#FBF7F0] px-4 font-sans text-[15px] text-[#4A3B2E] outline-none placeholder:text-[#B7AA97] focus:border-[#4A3B2E]";

const passwordInputCls = cn(inputCls, "pr-12");

// Design size of the notebook + auth-buttons group (notebook 512 + gap 26 + 3 buttons/gaps 168),
// used to scale the whole group uniformly to fit the available viewport space.
const STAGE_WIDTH = 354;
const STAGE_HEIGHT = 706;

export const WelcomeScreen = () => {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [emailSheetOpen, setEmailSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Only clear the session on an explicit logout (/login?logout=1). Arriving here
  // any other way (e.g. a transient redirect) must NOT log the user out.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("logout")) {
      api.logout();
    }
    try {
      setLastName(window.localStorage.getItem(LAST_NAME_KEY));
    } catch {
      /* ignore (private mode etc.) */
    }
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const finish = (displayName: string) => {
    setSignedInName(displayName);
    setEmailSheetOpen(false);
    try {
      window.localStorage.setItem(LAST_NAME_KEY, displayName);
    } catch {
      /* ignore (private mode etc.) */
    }
    setTimeout(() => router.push("/"), 650);
  };

  // Google/Apple are owned by another teammate and still in development.
  // Buttons stay in the UI; for now they show a note instead of signing in.
  const handleGoogle = () => {
    setError(null);
    setInfo("Google sign-in is coming soon — use email for now.");
  };

  const handleApple = () => {
    setError(null);
    setInfo("Apple sign-in is coming soon — use email for now.");
  };

  const handleOpenEmailSheet = () => {
    setError(null);
    setInfo(null);
    setEmailSheetOpen(true);
  };

  const handleEmailSheetOpenChange = (open: boolean) => {
    setEmailSheetOpen(open);
    if (!open) {
      setError(null);
    }
  };

  const handleEmailSheetInitialFocus = () => {
    return mode === "register" ? nameInputRef.current : emailInputRef.current;
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const handleToggleMode = () => {
    setMode(mode === "register" ? "signin" : "register");
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async () => {
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
      finish(user.display_name);
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
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex h-svh w-full items-center justify-center overflow-hidden bg-[#F2F2ED]">
        <div className="flex h-full w-full max-w-[430px] items-center justify-center px-5 py-8">
          <div ref={stageRef} className="flex h-full w-full items-center justify-center">
            <div
              className="flex flex-col items-center justify-center gap-[26px]"
              style={{ width: STAGE_WIDTH, transform: `scale(${scale})` }}
            >
              <div className="login-rise">
                <Notebook ownerName={signedInName ?? lastName} />
              </div>

              {!signedInName && (
                <div className="flex w-[300px] max-w-full flex-col gap-3">
                  <AuthButton
                    variant="email"
                    label="Continue with Email"
                    onClick={handleOpenEmailSheet}
                  />

                  {/* Third-party sign-in (in development — kept for the teammate to wire) */}
                  <AuthButton
                    variant="google"
                    label="Continue with Google"
                    onClick={handleGoogle}
                  />
                  <AuthButton variant="apple" label="Continue with Apple" onClick={handleApple} />

                  {info && <p className="font-sans text-[13px] text-[#8A7A69]">{info}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <Drawer.Root open={emailSheetOpen} onOpenChange={handleEmailSheetOpenChange}>
          <Drawer.VirtualKeyboardProvider>
            <Drawer.Portal>
              <Drawer.Backdrop
                className={cn(
                  "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
                  "[transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
                  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
                  "motion-reduce:transition-none",
                )}
              />
              <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
                <Drawer.Popup
                  initialFocus={handleEmailSheetInitialFocus}
                  className={cn(
                    "relative w-full max-w-[430px] rounded-t-[28px] bg-white px-5 pt-3",
                    "pb-[calc(24px+var(--drawer-keyboard-inset,0px))]",
                    "shadow-[0_-8px_32px_rgba(74,59,46,0.12)]",
                    "transition-transform duration-[250ms] will-change-transform",
                    "[transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
                    "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
                    "motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[ending-style]:translate-y-0",
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#DDD2C0]"
                  />
                  <Drawer.Title className="sr-only">
                    {mode === "register" ? "Create account with email" : "Sign in with email"}
                  </Drawer.Title>
                  <Drawer.Content className="flex flex-col gap-3 pb-2">
                    {mode === "register" && (
                      <input
                        ref={nameInputRef}
                        className={inputCls}
                        placeholder="Your name"
                        autoComplete="name"
                        value={name}
                        onChange={handleNameChange}
                      />
                    )}
                    <input
                      ref={emailInputRef}
                      className={inputCls}
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="Email"
                      value={email}
                      onChange={handleEmailChange}
                    />
                    <div className="relative w-full">
                      <input
                        className={passwordInputCls}
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "register" ? "new-password" : "current-password"}
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            void handleSubmit();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleTogglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className={cn(
                          "absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8A7A69] outline-none",
                          "transition-[color,background-color] duration-200 ease",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
                          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#DDD2C0]/40",
                          "[@media(hover:hover)_and_(pointer:fine)]:hover:text-[#4A3B2E]",
                        )}
                      >
                        {showPassword ? (
                          <EyeOff className="size-[18px]" aria-hidden="true" />
                        ) : (
                          <Eye className="size-[18px]" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    {error && <p className="font-sans text-[13px] text-[#D0392F]">{error}</p>}

                    <AuthButton
                      variant="create"
                      label={
                        loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"
                      }
                      onClick={() => {
                        void handleSubmit();
                      }}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="pb-1 font-sans text-[13px] text-[#8A7A69] underline underline-offset-2"
                    >
                      {mode === "register" ? "Have an account? Sign in" : "New here? Create an account"}
                    </button>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.VirtualKeyboardProvider>
        </Drawer.Root>
      </main>
    </MotionConfig>
  );
};
