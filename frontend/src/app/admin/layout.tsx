import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["ADMIN"]}>{children}</RouteGuard>;
}
