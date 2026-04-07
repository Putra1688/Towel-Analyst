import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGoogleSheet } from "@/lib/google-sheets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).userId;
  const { rpe, duration } = await request.json();

  try {
    const doc = await getGoogleSheet();
    if (!doc) {
      // If no Google Sheets, just return success (Mock mode)
      return NextResponse.json({ message: "Mock success" });
    }

    const logbookSheet = doc.sheetsByTitle["logbook_harian"];
    if (!logbookSheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    await logbookSheet.addRow({
      User_ID: userId,
      Date: new Date().toISOString().split('T')[0],
      RPE: rpe,
      Duration: duration,
      Activity: "Self Logged",
    });

    return NextResponse.json({ message: "Successfully logged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
