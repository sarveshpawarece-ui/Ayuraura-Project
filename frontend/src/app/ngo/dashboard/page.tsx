"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Stethoscope,
  PlusCircle,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  BarChart3,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStatsCard,
  DashboardSection,
  DashboardCard,
  DashboardQuickActions,
  DashboardLoadingSkeleton,
} from "@/components/dashboard";

interface CampItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  capacity: number;
  registeredCount: number;
  services: string[];
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
}

export default function NGODashboardPage() {
  const [loading, setLoading] = useState(false);

  const camps: CampItem[] = [
    {
      id: "camp-1",
      title: "Mega AYUSH Rural Wellness & Suvarnaprashan Camp",
      date: "15 Oct 2026",
      time: "09:00 AM - 04:00 PM",
      venue: "Gram Panchayat Sabhagruh, Khed",
      city: "Pune",
      capacity: 250,
      registeredCount: 142,
      services: [
        "General Health Checkup",
        "Prakriti Analysis",
        "Suvarnaprashan Administration",
      ],
      status: "UPCOMING",
    },
    {
      id: "camp-2",
      title: "Geriatric Ayurveda & Joint Mobility Free Camp",
      date: "22 Oct 2026",
      time: "10:00 AM - 05:00 PM",
      venue: "Senior Citizens Community Hall",
      city: "Nashik",
      capacity: 180,
      registeredCount: 110,
      services: [
        "Ayurveda Consultation",
        "Nadi Pariksha Examination",
        "Herbal Oil Distribution",
      ],
      status: "UPCOMING",
    },
    {
      id: "camp-3",
      title: "Tribal AYUSH Preventive Healthcare & Dietetics Outreach",
      date: "05 Nov 2026",
      time: "08:30 AM - 03:30 PM",
      venue: "Ashram Shala Ground",
      city: "Thane",
      capacity: 300,
      registeredCount: 85,
      services: [
        "General Health Checkup",
        "Suvarnaprashan Drops",
        "Anemia & Nutrition Triage",
      ],
      status: "UPCOMING",
    },
  ];

  const quickActions = [
    {
      title: "Create Health Camp",
      description: "Setup OPD slots & Suvarnaprashan venue",
      icon: PlusCircle,
      href: "/camps",
      colorVariant: "emerald" as const,
    },
    {
      title: "Volunteer Roster",
      description: "Manage student volunteers & doctor leads",
      icon: Users,
      href: "/camps?tab=volunteer",
      colorVariant: "teal" as const,
    },
    {
      title: "Camp Analytics & Reports",
      description: "Beneficiary reach & disease epidemiology",
      icon: BarChart3,
      href: "/camps",
      colorVariant: "purple" as const,
    },
    {
      title: "Verifiable Certificates",
      description: "Issue SHA-256 cryptographic community credit",
      icon: Award,
      href: "/verify/certificate",
      colorVariant: "amber" as const,
    },
  ];

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <DashboardLayout>
      {/* Signature AyurSetu Header */}
      <DashboardHeader
        badgeText="NGO Community Healthcare Portal"
        badgeIcon={<HeartHandshake className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="AYUSH Community Healthcare & Outreach"
        subtitle="Coordinate free health camps, manage Suvarnaprashan drives, verify volunteer service hours, and issue cryptographic certificates."
        statusBadge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> DARPAN VERIFIED NGO
          </span>
        }
        actions={[
          {
            label: "Create Health Camp",
            href: "/camps",
            icon: PlusCircle,
            variant: "amber",
          },
          {
            label: "Camp Directory",
            href: "/camps",
            icon: HeartHandshake,
            variant: "secondary",
          },
        ]}
      />

      {/* Standard Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatsCard
          title="Active Camps"
          value="4"
          subtitle="3 Upcoming • 1 Ongoing"
          icon={HeartHandshake}
          colorVariant="emerald"
          href="/camps"
        />

        <DashboardStatsCard
          title="Beneficiaries Served"
          value="730+"
          subtitle="Rural & tribal health checkups"
          icon={Users}
          colorVariant="blue"
          href="/camps"
        />

        <DashboardStatsCard
          title="Volunteer Hours"
          value="340 hrs"
          subtitle="Student clinical community credits"
          icon={Clock}
          colorVariant="amber"
          href="/camps"
        />

        <DashboardStatsCard
          title="Doctors Engaged"
          value="18"
          subtitle="NCISM registered clinicians"
          icon={Stethoscope}
          colorVariant="purple"
          href="/camps"
        />
      </div>

      {/* Section: Quick Actions */}
      <DashboardSection
        title="NGO Quick Actions"
        subtitle="Setup new healthcare drives, allocate volunteer slots, track attendees, and generate impact reports"
        icon={Compass}
      >
        <DashboardQuickActions actions={quickActions} columns={4} />
      </DashboardSection>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Upcoming Camps Overview */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard
            title="Scheduled Health Camps & Outreach"
            subtitle="Live registration counts and multi-specialty OPD venue schedules"
            icon={HeartHandshake}
            headerAction={
              <Link
                href="/camps"
                className="text-xs font-semibold text-[#2F6B4F] dark:text-[#6FAF8A] hover:text-[#24563F] dark:hover:text-[#8BC4A2] inline-flex items-center gap-1"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-4">
              {camps.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] hover:border-[#2F6B4F]/40 dark:hover:border-[#6FAF8A]/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCE8DF] dark:bg-[#26372D] text-[#2F6B4F] dark:text-[#6FAF8A] border border-[#DCE4DE] dark:border-[#2B3A31]">
                        {camp.status}
                      </span>
                      <h4 className="font-bold text-base font-serif-heading text-[#1B2A22] dark:text-[#E8F1EB] mt-1.5">
                        {camp.title}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-semibold text-[#64736A] dark:text-[#A9B9AE] bg-white dark:bg-[#17221C] px-3 py-1 rounded-lg border border-[#DCE4DE] dark:border-[#2B3A31] self-start sm:self-center">
                      {camp.date}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64736A] dark:text-[#A9B9AE]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#3D8B5A] dark:text-[#72C58D] shrink-0" />
                      {camp.venue}, {camp.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C58A32] dark:text-[#E4B45D] shrink-0" />
                      {camp.time}
                    </span>
                  </div>

                  {/* Progress & Services */}
                  <div className="pt-2 border-t border-[#DCE4DE] dark:border-[#2B3A31] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {camp.services.slice(0, 2).map((srv, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#17221C] border border-[#DCE4DE] dark:border-[#2B3A31] text-[11px] text-[#1B2A22] dark:text-[#E8F1EB]"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#1B2A22] dark:text-[#E8F1EB]">
                        {camp.registeredCount} / {camp.capacity}
                      </span>{" "}
                      <span className="text-[#64736A] dark:text-[#A9B9AE]">
                        Registered
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Right Column (4 cols): Impact & Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Volunteer Certificate Verification Card */}
          <DashboardCard
            title="Cryptographic Certificates"
            subtitle="SHA-256 verifiable community service credits"
            icon={Award}
          >
            <div className="space-y-3">
              <p className="text-xs text-[#64736A] dark:text-[#A9B9AE] leading-relaxed">
                Student volunteers serving in your rural health camps receive tamper-proof certificates verifiable by academic institutions and hospitals.
              </p>
              <div className="p-3.5 rounded-xl bg-[#F7F9F4] dark:bg-[#0F1713] border border-[#DCE4DE] dark:border-[#2B3A31] space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#1B2A22] dark:text-[#E8F1EB]">
                  <span>Active Volunteers</span>
                  <span className="font-mono text-[#2F6B4F] dark:text-[#6FAF8A]">24 Students</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-[#1B2A22] dark:text-[#E8F1EB]">
                  <span>Certificates Issued</span>
                  <span className="font-mono text-[#2F6B4F] dark:text-[#6FAF8A]">112 Total</span>
                </div>
              </div>

              <Link
                href="/camps"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#24563F] dark:bg-[#6FAF8A] dark:hover:bg-[#8BC4A2] text-white dark:text-[#0F1713] text-xs font-semibold shadow-xs transition-all"
              >
                <span>Manage Volunteer Hours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </DashboardCard>

          {/* Darpan NGO Trust Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E4D37] via-[#2F6B4F] to-[#173A2A] dark:from-[#11241A] dark:via-[#172E21] dark:to-[#0F1D15] text-[#E8F1EB] shadow-md border border-[#2F6B4F]/30 dark:border-[#2B3A31] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C58A32] dark:text-[#E4B45D]" />
              <h4 className="font-serif-heading font-bold text-sm text-white">
                AYUSH Darpan Network
              </h4>
            </div>
            <p className="text-xs text-[#DCE8DF] dark:text-[#A9B9AE] leading-relaxed">
              Partner with registered BAMS colleges and Ayurvedic doctors to scale preventative health reach and Suvarnaprashan coverage across India.
            </p>
            <Link
              href="/camps"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C58A32] dark:text-[#E4B45D] hover:underline"
            >
              <span>Explore Camp Guidelines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
