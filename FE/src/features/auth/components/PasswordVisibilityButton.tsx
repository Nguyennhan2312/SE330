type PasswordVisibilityButtonProps = {
  isVisible: boolean;
  onClick: () => void;
  label?: string;
};

export function PasswordVisibilityButton({
  isVisible,
  onClick,
  label = "password",
}: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
      title={isVisible ? `Hide ${label}` : `Show ${label}`}
      className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#667085] transition hover:bg-black/[0.06] hover:text-black focus:outline-none focus:ring-2 focus:ring-black/10"
      onClick={onClick}
    >
      <span className="relative block h-3.5 w-[18px] rounded-[50%] border-2 border-current">
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
        {!isVisible && (
          <span className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
        )}
      </span>
    </button>
  );
}
