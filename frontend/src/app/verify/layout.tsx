"use client";

import React from "react";
import RouteGuard from "@/components/RouteGuard";

export default function VerifyLayout({
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
