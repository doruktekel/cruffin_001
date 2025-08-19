import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";

export const GET = async () => {
  try {
    const { status, user, error } = await protectRoute();

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
