import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function HerbsResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["AUTHENTICATED"]}>
      {children}
    </RouteGuard>
  );
}
