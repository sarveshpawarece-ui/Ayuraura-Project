import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function CommunityForumLayout({
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
