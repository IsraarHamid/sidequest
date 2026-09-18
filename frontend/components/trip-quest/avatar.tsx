type AvatarProps = {
  initials: string;
  color: string;
  size?: number;
  fontSize?: number;
};

/** Round avatar chip with initials — the same shape repeated across crew lists,
 * leaderboard rows, the passport profile, and trip-card member stacks. */
export function Avatar({ initials, color, size = 40, fontSize = 14 }: AvatarProps) {
  return (
    <div
      className="box-border shrink-0 flex flex-row justify-center items-center [outline:2px_solid_#FBF7F0] [outline-offset:-1px] rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <div
        className="box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap"
        style={{ fontSize }}
      >
        {initials}
      </div>
    </div>
  );
}
