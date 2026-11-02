import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const assigned = [];
const placements = [];
const empty = async () => [];
const query = { select() { return this; }, in: async () => ({ data: [], error: null }) };
const h = domHarness({
  '@/lib/supabase': { supabase: { from: () => query } },
  '@/lib/realm-progress-compat': {
    fetchRealmCompatProgressForClass: async realm => placements.filter(row => row.realm_id === realm),
    fetchTeacherRealmPlacements: async () => placements,
    teacherChangeStartingLevels: async (realm, edits) => {
      for (const edit of edits) placements.push({ student_id: edit.studentId, realm_id: realm,
        assigned_start_level: edit.assignedLevel, assigned_entry_mode: edit.entryMode });
    },
  },
  '@/lib/whole-maths-diagnostic-client': {
    fetchTeacherDiagnostics: empty, fetchTeacherLiveMathsProgression: empty,
    fetchDiagnosticSchoolSession: async () => null,
    assignWholeMathsDiagnostic: async id => { assigned.push(id); },
  },
  '@/components/brand/ReliqAdultLogo': { __esModule: true, default: () => null },
});
const students = [
  { id: 'retained', display_name: 'A Retained', school_year_level: 'Year 3' },
  { id: 'removed', display_name: 'B Removed', school_year_level: 'Year 3' },
];
const cls = { id: 'fictional-class', name: 'Fictional class' };
const button = text => [...h.document.querySelectorAll('button')].find(b => b.textContent.includes(text));
try {
  const Placement = h.load('components/teacher/PlacementManager.tsx').default;
  const props = { selectedClass: cls, students, onClose() {} };
  await h.render(Placement, props);
  await h.click(button('Choose levels'));
  const fill = h.document.querySelector('[aria-label="Fill empty placements with"]');
  assert(fill, 'Bulk placement control is present');
  await h.act(async () => { fill.value = 'Year 3'; fill.dispatchEvent(new h.document.defaultView.Event('change', { bubbles: true })); });
  const before = Number(button('Save placements').textContent.match(/\((\d+)\)/)[1]);
  assert(before > 0);
  await h.render(Placement, { ...props, students: students.slice(0,1) });
  const after = Number(button('Save placements').textContent.match(/\((\d+)\)/)[1]);
  assert.equal(after, before / 2, 'Removed student edits are excluded across all realms');
  await h.render(Placement, props);
  assert.equal(Number(button('Save placements').textContent.match(/\((\d+)\)/)[1]), after, 'Restoration does not resurrect discarded edits');
  await h.click(button('Save placements'));
  assert.equal(placements.length, after, 'Every retained edit was submitted');
  assert(placements.every(row => row.student_id === 'retained'), 'Removed student is never submitted');
  await h.render(Placement, { ...props, students: [] });
  assert(!button('Save placements') || button('Save placements').disabled, 'Empty roster has no queued changes');
  const Diagnostic = h.load('components/teacher/WholeMathsDiagnosticPanel.tsx').default;
  await h.render(Diagnostic, { selectedClass: cls, students });
  const run = button('Run diagnostic');
  if (run) await h.click(run);
  await h.click(h.document.querySelector('[aria-label="Assign Start / Mid / End diagnostic to students"]'));
  await h.render(Diagnostic, { selectedClass: cls, students: students.slice(0,1) });
  const submit = [...h.document.querySelectorAll('button')].find(b => /Assign.*1/.test(b.textContent));
  assert(submit, 'Assignment count reflects the remaining student');
  await h.click(submit);
  assert.deepEqual(assigned, ['retained'], 'Only the remaining student is submitted');
  console.log('PASS placement queue pruning, restoration, empty roster, and diagnostic assignment after roster removal.');
} finally { await h.close(); }
