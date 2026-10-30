"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { User, Award, Briefcase, Target, ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { api } from "@/lib/api";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      if (!studentId) return;
      try {
        const res = await api.get(`/institution/students/${studentId}`);
        setStudent(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-[#68776D] dark:text-[#98A99E] text-sm">
          Loading student details...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#526158] dark:text-[#C1CEC5]">
          <p>Student record not found or access restricted.</p>
          <Link href="/institution/students" className="text-[#2F6B4F] dark:text-[#78B895] font-bold hover:underline text-xs">
            Return to Student Directory
          </Link>
        </div>
      </div>
    );
  }

  const indicators = student.readiness_indicators || {};

  return (
    <div className="min-h-screen bg-[#F7F9F4] dark:bg-[#0D1511] text-[#17231C] dark:text-[#F1F6F2] font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Navigation back */}
        <Link
          href="/institution/students"
          className="inline-flex items-center gap-2 text-xs text-[#526158] hover:text-[#2F6B4F] dark:text-[#C1CEC5] dark:hover:text-[#78B895] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>

        {/* Header Profile Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DCEBE1] dark:bg-[#294637] border border-[#2F6B4F]/30 flex items-center justify-center text-[#2F6B4F] dark:text-[#78B895] font-extrabold text-xl">
              {student.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#142019] dark:text-white">{student.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4EF] dark:bg-[#223128] text-[#2F6B4F] dark:text-[#78B895] border border-[#D5DED8] dark:border-[#304036] text-[10px] font-bold uppercase">
                  {student.membership_status || "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-[#526158] dark:text-[#C1CEC5] mt-1">
                {student.email} • {student.degree_program || "BAMS"} {student.current_year ? `(Year ${student.current_year})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] uppercase font-semibold">Career Readiness</div>
              <div className={`text-sm font-extrabold mt-0.5 ${
                indicators.readiness_level === "CAREER_READY" ? "text-[#2F7D4A] dark:text-[#7BC894]" : "text-[#A96F16] dark:text-[#E5B85C]"
              }`}>
                {indicators.readiness_level || "DEVELOPING"}
              </div>
            </div>
          </div>
        </div>

        {/* Career Readiness Indicators Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-5 rounded-xl shadow-xs space-y-2">
            <div className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">Target Career Alignment</div>
            <div className="text-lg font-extrabold text-[#142019] dark:text-white">
              {student.target_career_title || "Not Selected"}
            </div>
            <div className="text-[10px] text-[#68776D] dark:text-[#98A99E]">Alignment: {indicators.career_alignment_level || "MEDIUM"}</div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-5 rounded-xl shadow-xs space-y-2">
            <div className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">Skill Alignment Score</div>
            <div className="text-lg font-extrabold text-[#2F7D4A] dark:text-[#7BC894] font-mono">
              {indicators.skill_alignment_score || 0} / 100
            </div>
            <div className="text-[10px] text-[#2F7D4A] dark:text-[#7BC894] font-semibold">Assessment Status: {indicators.assessment_status}</div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-5 rounded-xl shadow-xs space-y-2">
            <div className="text-xs text-[#526158] dark:text-[#C1CEC5] font-medium">Profile Completion</div>
            <div className="text-lg font-extrabold text-[#356F9D] dark:text-[#80B5DD] font-mono">
              {indicators.profile_completion_pct || 0}%
            </div>
            <div className="text-[10px] text-[#356F9D] dark:text-[#80B5DD] font-semibold">Institutional Verified</div>
          </div>
        </div>

        {/* Evaluated Skills Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Evaluated Skill Scores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.evaluated_skills?.map((s: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17231C] dark:text-[#F1F6F2]">{s.skill_name}</div>
                  <div className="text-[10px] text-[#68776D] dark:text-[#98A99E] capitalize mt-0.5">{s.proficiency_level}</div>
                </div>
                <div className="text-sm font-extrabold text-[#2F6B4F] dark:text-[#78B895] font-mono">
                  {s.score} / 100
                </div>
              </div>
            ))}

            {(!student.evaluated_skills || student.evaluated_skills.length === 0) && (
              <div className="col-span-2 text-center py-6 text-[#68776D] dark:text-[#98A99E] text-xs italic">
                No skill score evaluations recorded yet for this student.
              </div>
            )}
          </div>
        </div>

        {/* Applications Monitor Section */}
        <div className="bg-[#FFFFFF] dark:bg-[#17211B] border border-[#D5DED8] dark:border-[#304036] p-6 rounded-2xl shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#142019] dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2F6B4F] dark:text-[#78B895]" /> Opportunity Application History
          </h2>

          <div className="space-y-3">
            {student.applications?.map((app: any) => (
              <div key={app.id} className="p-4 rounded-xl bg-[#EEF4EF] dark:bg-[#223128] border border-[#D5DED8] dark:border-[#304036] flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#17231C] dark:text-[#F1F6F2]">{app.opportunity_title}</div>
                  <div className="text-[10px] text-[#526158] dark:text-[#C1CEC5] mt-0.5">
                    Match Score: <span className="text-[#2F6B4F] dark:text-[#78B895] font-bold">{app.match_score}%</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#DCEBE1] dark:bg-[#294637] text-[#2F6B4F] dark:text-[#78B895] border border-[#2F6B4F]/30">
                  {app.status}
                </span>
              </div>
            ))}

            {(!student.applications || student.applications.length === 0) && (
              <div className="text-center py-6 text-[#68776D] dark:text-[#98A99E] text-xs italic">
                No active industry applications recorded for this student.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
