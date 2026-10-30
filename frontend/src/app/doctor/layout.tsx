import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={["DOCTOR", "ADMIN"]}>{children}</RouteGuard>;
}
