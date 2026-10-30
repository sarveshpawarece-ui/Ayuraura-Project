import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["STUDENT", "ADMIN"]}>{children}</RouteGuard>;
}
