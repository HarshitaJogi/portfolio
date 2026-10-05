import { NextResponse, type NextRequest } from "next/server";

/** `/?view=skim` → the text version. Anything else passes through. */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/skim";
  url.searchParams.delete("view");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [{ source: "/", has: [{ type: "query", key: "view", value: "skim" }] }],
};
