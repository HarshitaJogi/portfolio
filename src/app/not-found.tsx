import Link from "next/link";
import { notFound as copy } from "@/content/profile";
import { NotFoundMark } from "./NotFoundMark";

export default function NotFound() {
  return (
    <main id="main" className="relative z-10 grid min-h-[100svh] place-items-center px-6 text-center">
      <div>
        <h1 className="sr-only">404</h1>
        <NotFoundMark />
        <p className="font-display mt-6 text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] leading-tight">{copy.title}</p>
        <Link href="/" className="link mt-8 inline-block font-mono text-[0.875rem] tracking-[0.06em] uppercase">
          {copy.back}
        </Link>
      </div>
    </main>
  );
}
