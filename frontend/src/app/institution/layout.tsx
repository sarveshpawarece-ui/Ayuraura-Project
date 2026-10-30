import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["INSTITUTION", "ADMIN"]}>{children}</RouteGuard>;
}
