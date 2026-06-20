import Link from "next/link";

type BrandMarkProps = {
  tone?: "light" | "dark";
};

export function BrandMark({ tone = "light" }: BrandMarkProps) {
  const textColor = tone === "light" ? "text-white" : "text-black";

  return (
    <Link href="/" className="flex items-center font-bold">
      <span className={`font-serif text-2xl font-bold ${textColor}`}>The Athenaeum</span>
    </Link>
  );
}
