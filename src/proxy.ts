import { NextResponse, type NextRequest } from "next/server";
import { parseTrack } from "@/lib/sanitize";

/** `/?track=ai|data|swe|systems` → the pre-rendered `/t/<track>` page. Anything else passes through. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.searchParams.get("view") === "skim") {
    const url = request.nextUrl.clone();
    url.pathname = "/skim";
    url.searchParams.delete("view");
    return NextResponse.redirect(url);
  }
  const track = parseTrack(request.nextUrl.searchParams.get("track"));
  if (!track) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/t/${track}`;
  url.searchParams.delete("track");
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    { source: "/", has: [{ type: "query", key: "track" }] },
    { source: "/", has: [{ type: "query", key: "view" }] },
  ],
};
