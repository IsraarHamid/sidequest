"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { cn } from "cn";

type AuthVariant = "create" | "google" | "apple";

const OWNER_NAME = "Jackie";

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
}: {
  label: string;
  variant: AuthVariant;
  onClick: () => void;
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-full font-sans font-semibold outline-none",
        "transition-[transform,box-shadow] duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
        "active:scale-[0.97]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
        variant === "create" && "bg-[#121212] px-8 text-[15px] text-[#FBF7F0]",
        variant === "google" &&
          "border border-[#747775] bg-white px-8 text-[15px] font-medium tracking-[0.25px] text-[#1F1F1F]",
        variant === "apple" && "bg-black px-8 text-[16px] text-white",
      )}
    >
      {label}
    </button>
  );
};

const Notebook = ({ ownerName }: { ownerName: string | null }) => (
  <div className="relative w-[354px] max-w-full">
    <div
      aria-hidden="true"
      className="absolute -top-5 left-3 -z-10 h-[500px] w-[320px] rotate-[-1.34deg] bg-[#CCCCCC] motion-reduce:rotate-0"
    />

    <div className="relative z-10 h-[512px] w-full overflow-hidden rounded-[8px_20px_20px_8px] bg-[#416E51] shadow-[0_4px_4px_#00000040] rotate-[1.67deg] motion-reduce:rotate-0">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[10px] w-[11px] bg-black/[0.09]"
      />

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

export const WelcomeScreen = () => {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleContinue = () => {
    router.push("/");
  };

  const handleNotebookKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleContinue();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#F2F2ED]">
        <div className="flex w-full max-w-[430px] flex-col items-center justify-center gap-[30px] px-5 py-8">
          <div
            className="login-rise"
            role={isSignedIn ? "button" : undefined}
            tabIndex={isSignedIn ? 0 : undefined}
            aria-label={isSignedIn ? `Continue as ${OWNER_NAME}` : undefined}
            onClick={isSignedIn ? handleContinue : undefined}
            onKeyDown={isSignedIn ? handleNotebookKeyDown : undefined}
          >
            <Notebook ownerName={isSignedIn ? OWNER_NAME : null} />
          </div>

          {!isSignedIn ? (
            <div className="flex w-[296px] max-w-full flex-col gap-4">
              <AuthButton
                variant="create"
                label="Create account"
                onClick={handleSignIn}
              />
              <AuthButton
                variant="google"
                label="Continue with Google"
                onClick={handleSignIn}
              />
              <AuthButton
                variant="apple"
                label="Continue with Apple"
                onClick={handleSignIn}
              />
            </div>
          ) : null}
        </div>
      </main>
    </MotionConfig>
  );
};
