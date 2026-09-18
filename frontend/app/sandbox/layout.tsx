export default function SandboxLayout({
  children,
}: LayoutProps<"/sandbox">) {
  return (
    <div className="h-full w-full min-h-0 min-w-0 overflow-hidden bg-[#1E1A16]">
      {children}
    </div>
  );
}
