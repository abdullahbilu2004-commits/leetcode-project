import { getCurrentUser, json, apiError } from "@/lib/auth";
import { navigate } from "@/services/problemService";

export async function GET(req, { params }) {
  const { slug } = await params;
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const user = await getCurrentUser();
  try {
    return json(await navigate(slug, q, user?._id));
  } catch {
    return apiError("Navigation failed.", 500);
  }
}
