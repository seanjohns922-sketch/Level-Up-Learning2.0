"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
  created_at: string;
};

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string;
};

export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      loadClasses();
    });
  }, []);

  async function loadClasses() {
    const { data: teacherId, error: teacherErr } = await supabase.rpc("get_teacher_id");
    if (!teacherId) {
      console.warn("[TeacherClasses] missing teacher profile", teacherErr);
      setClasses([]);
      setStudents([]);
      setLoading(false);
      return;
    }

    const { data: cls } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    setClasses(cls ?? []);
    if (cls && cls.length > 0) {
      const classIds = cls.map((c) => c.id);
      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .in("class_id", classIds);
      setStudents(studs ?? []);
    } else {
      setStudents([]);
    }
    setLoading(false);
  }

  const studentsForClass = (classId: string) =>
    students.filter((s) => s.class_id === classId);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Classes</h1>
          <button
            onClick={() => router.push("/teacher/classes/new")}
            className="px-5 py-2.5 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold hover:bg-[#8fcea4] transition"
          >
            + New Class
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No classes yet.</p>
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-6 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {classes.map((cls) => {
              const studs = studentsForClass(cls.id);
              return (
                <div
                  key={cls.id}
                  className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{cls.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Code: <span className="font-mono font-bold tracking-wider">{cls.class_code}</span>
                        {" · "}Year {cls.year_level}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                      {studs.length} student{studs.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {studs.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {studs.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-xl"
                        >
                          <span className="font-semibold text-gray-700">{s.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => router.push("/login")}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
