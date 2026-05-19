import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/seller/profile")({
  beforeLoad: () => { throw redirect({ to: "/profile" }); },
  component: () => null,
});
