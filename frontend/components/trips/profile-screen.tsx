"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { api, isAuthError, type User } from "@/lib/api";

export function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        setUser(me);
        setName(me.display_name);
      } catch (e) {
        if (isAuthError(e)) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.display_name) {
      setEditingName(false);
      setName(user?.display_name ?? "");
      return;
    }
    setSavingName(true);
    setError(null);
    try {
      const updated = await api.updateProfile(trimmed);
      setUser(updated);
      setEditingName(false);
    } catch {
      setError("Couldn't save your name. Try again.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleAvatarPick(file: File | undefined) {
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const updated = await api.uploadAvatar(file);
      setUser(updated);
    } catch {
      setError("Couldn't upload your photo. Try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount();
      router.replace("/login");
    } catch {
      setError("Couldn't delete your account. Try again.");
      setDeleting(false);
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-svh w-full items-center justify-center bg-[#F2F2ED]">
        <p className="font-sans text-[15px] text-[#8A7A69]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border flex w-full flex-col items-start gap-[28px] p-[16px_20px_32px_20px]">
          <PageHeader title="Profile" />

          <div className="flex w-full flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              className="group relative h-[104px] w-[104px] shrink-0 rounded-full outline-none transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <div
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-full outline-2 -outline-offset-1 outline-[#FBF7F0] shadow-[0px_1px_2px_0px_#4A3B2E14]"
                style={{ backgroundColor: user.avatar_color ?? "#3E6B4A" }}
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-sans text-[28px] font-bold text-[#FBF7F0]">
                    {user.initials ?? "SQ"}
                  </span>
                )}
              </div>
              <div className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#121212] outline-2 outline-[#F2F2ED] [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-[#2b2b2b]">
                {uploadingAvatar ? (
                  <Loader2 className="h-[15px] w-[15px] animate-spin text-[#FBF7F0]" />
                ) : (
                  <Camera className="h-[15px] w-[15px] text-[#FBF7F0]" strokeWidth={2.25} />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleAvatarPick(e.target.files?.[0])}
            />
          </div>

          <div className="box-border flex w-full flex-col items-start gap-2">
            <p className="font-sans text-[11px] font-medium tracking-[1px] text-[#8A7A69] uppercase">
              Name
            </p>
            {editingName ? (
              <div className="box-border flex w-full flex-row items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={40}
                  className="box-border h-12 w-full flex-1 rounded-full bg-[#FBF7F0] px-4 font-sans text-[15px] font-medium text-[#4A3B2E] outline outline-1 -outline-offset-[0.5px] outline-[#DDD2C0] focus-visible:outline-2 focus-visible:outline-[#121212]"
                />
                <button
                  type="button"
                  onClick={saveName}
                  disabled={savingName}
                  aria-label="Save name"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#121212] active:scale-[0.97]"
                >
                  {savingName ? (
                    <Loader2 className="h-[17px] w-[17px] animate-spin text-[#FBF7F0]" />
                  ) : (
                    <Check className="h-[17px] w-[17px] text-[#FBF7F0]" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="box-border flex h-12 w-full flex-row items-center justify-between gap-2 rounded-full bg-[#FBF7F0] px-4 outline outline-1 -outline-offset-[0.5px] outline-[#DDD2C0] active:scale-[0.98]"
              >
                <span className="font-sans text-[15px] font-medium text-[#4A3B2E]">
                  {user.display_name}
                </span>
                <Pencil className="h-[15px] w-[15px] shrink-0 text-[#8A7A69]" />
              </button>
            )}
          </div>

          <div className="box-border flex w-full flex-col items-start gap-2">
            <p className="font-sans text-[11px] font-medium tracking-[1px] text-[#8A7A69] uppercase">
              Email
            </p>
            <div className="box-border flex h-12 w-full flex-row items-center rounded-full bg-[#DDD2C0]/30 px-4">
              <span className="font-sans text-[15px] font-medium text-[#8A7A69]">
                {user.email ?? "No email on this account"}
              </span>
            </div>
          </div>

          {error && (
            <p className="w-full font-sans text-[13px] font-medium text-[#D0392F]">{error}</p>
          )}

          <div className="box-border flex w-full flex-col items-start gap-2 border-t border-[#DDD2C0] pt-[24px]">
            {confirmingDelete ? (
              <div className="box-border flex w-full flex-col items-start gap-3 rounded-2xl bg-[#D0392F]/8 p-4">
                <p className="font-sans text-[13px]/[18px] font-medium text-[#4A3B2E]">
                  Delete your account and every trip you host? This can&apos;t be undone.
                </p>
                <div className="flex w-full flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#FBF7F0] font-sans text-[14px] font-semibold text-[#4A3B2E] outline outline-1 -outline-offset-[0.5px] outline-[#DDD2C0] active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#D0392F] font-sans text-[14px] font-semibold text-[#FBF7F0] active:scale-[0.97] disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-[15px] w-[15px] animate-spin" /> : "Delete account"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="box-border flex h-12 w-full flex-row items-center justify-center gap-2 rounded-full text-[#D0392F] transition-[background-color] active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#D0392F]/8"
              >
                <Trash2 className="h-[16px] w-[16px]" />
                <span className="font-sans text-[14px] font-semibold">Delete account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
