import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["NGO", "ADMIN"]}>{children}</RouteGuard>;
}
