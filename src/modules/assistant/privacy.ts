import { AuthUser } from "../../middlewares/authenticate";

export function canSeeLocation(
  ev: { visibility: string; organizerId: string },
  viewer: AuthUser | null | undefined,
  status: string
): boolean {
  return (
    ev.visibility === "PUBLIC" ||
    viewer?.role === "ADMIN" ||
    viewer?.id === ev.organizerId ||
    status === "APPROVED"
  );
}
