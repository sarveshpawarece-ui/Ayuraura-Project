"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardLayout,
  DashboardHeader,
  DashboardLoadingSkeleton
} from "@/components/dashboard";

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faculty/students");
      setStudents(res.data);
    } catch (e) {
      console.error("Error loading students:", e);
      // Demo fallback
      setStudents([
        {
          student_id: "s-1",
          full_name: "Aditya Verma",
          email: "aditya.verma@ayursetu.edu",
          academic_year: "1st Year",
          degree_program: "BAMS (Ayurvedacharya)",
          enrollment_number: "BAMS-2026-0042",
          attendance_status: "REGULAR"
        },
        {
          student_id: "s-2",
          full_name: "Rutuja Kulkarni",
          email: "rutuja.k@ayursetu.edu",
          academic_year: "1st Year",
          degree_program: "BAMS (Ayurvedacharya)",
          enrollment_number: "BAMS-2026-0089",
          attendance_status: "REGULAR"
        },
        {
          student_id: "s-3",
          full_name: "Rohan Deshmukh",
          email: "rohan.d@ayursetu.edu",
          academic_year: "2nd Year",
          degree_program: "BAMS (Ayurvedacharya)",
          enrollment_number: "BAMS-2025-0014",
          attendance_status: "REGULAR"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollment_number?.toLowerCase().includes(search.toLowerCase());
    const matchesYear = selectedYear === "ALL" || s.academic_year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href="/faculty/dashboard"
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
        </Link>
      </div>

      <DashboardHeader
        badgeText="Class Roster & Cohort Management"
        badgeIcon={<Users className="w-3.5 h-3.5" />}
        badgeVariant="emerald"
        title="Enrolled BAMS Scholars Directory"
        subtitle="View enrolled scholars across your assigned academic years and departments."
      />

      {/* Privacy Notice Alert */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-slate-300 text-xs flex items-start gap-3 mb-6">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Student Privacy Safeguard:</strong> In accordance with educational data protection policies, students' private study notes and personal AI consultation chat histories remain strictly confidential and are not visible in faculty roster views.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, enrollment #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Academic Years</option>
          <option value="1st Year">1st Year BAMS</option>
          <option value="2nd Year">2nd Year BAMS</option>
          <option value="3rd Year">3rd Year BAMS</option>
          <option value="4th Year">4th Year BAMS</option>
        </select>
      </div>

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No students found</h4>
          <p className="text-xs text-slate-500 mt-1">Try refining your search filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Enrollment #</th>
                <th className="py-3 px-4">Curriculum Year</th>
                <th className="py-3 px-4">Degree Program</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      {s.full_name?.charAt(0) || "S"}
                    </div>
                    <span>{s.full_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {s.enrollment_number || "PENDING"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.academic_year}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{s.degree_program}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {s.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {s.email}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      <UserCheck className="w-3 h-3" /> {s.attendance_status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
