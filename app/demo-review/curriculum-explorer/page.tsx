"use client";

import CurriculumExplorer from "@/components/teacher/CurriculumExplorer";

/** Review-only: the teacher Curriculum tab with no class data, for checking its styling. */
export default function CurriculumExplorerReview() {
  return (
    <main className="reliq-adult min-h-screen bg-[#f4f5f1] p-6">
      <CurriculumExplorer yearLabel="Year 1" studentCount={24} studentIds={[]} progress={[]} progressAvailable={false} />
    </main>
  );
}
