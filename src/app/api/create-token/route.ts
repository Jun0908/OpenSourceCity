import { createToken } from "@/lib/pump";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await createToken();
    return NextResponse.json({ success: true, mint: result.mint });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
