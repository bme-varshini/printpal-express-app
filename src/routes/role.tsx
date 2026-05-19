import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/role")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});
