import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["INDUSTRY", "ADMIN"]}>{children}</RouteGuard>;
}
