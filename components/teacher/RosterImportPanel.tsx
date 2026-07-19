"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileSpreadsheet, Image as ImageIcon, Sparkles, Trash2, Upload, UserPlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  normalizeRosterStudents,
  parseRosterWorkbook,
  RosterDraft,
} from "@/lib/roster-import";
import { SCHOOL_YEAR_LEVEL_OPTIONS } from "@/lib/studentLevelLabel";

type ImportResult = { created: number; errors: string[] };

type Props = {
  classYearLevels: string[];
  onClose: () => void;
  onImport: (students: RosterDraft[]) => Promise<ImportResult>;
};

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(file);
  });
}

function rowIsValid(student: RosterDraft) {
  return Boolean(student.firstName.trim() && student.schoolYear && (!student.pin || /^\d{4}$/.test(student.pin)));
}

export function RosterImportPanel({ classYearLevels, onClose, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defaultYear, setDefaultYear] = useState(classYearLevels[0] ?? "");
  const [rows, setRows] = useState<RosterDraft[]>([]);
  const [fileName, setFileName] = useState("");
  const [working, setWorking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setWorking(true);
    setMessage("");
    setFileName(file.name);

    try {
      let importedRows: RosterDraft[];
      if (file.type.startsWith("image/")) {
        if (file.size > 8 * 1024 * 1024) throw new Error("Use an image smaller than 8 MB.");
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Your teacher session has expired. Please sign in again.");

        const response = await fetch("/api/roster-extract", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl: await readAsDataUrl(file), defaultYear }),
        });
        const payload = (await response.json()) as {
          students?: Array<Record<string, unknown>>;
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error || "Could not read that roster image.");
        importedRows = normalizeRosterStudents(payload.students ?? [], "image", defaultYear);
      } else {
        importedRows = await parseRosterWorkbook(file, defaultYear);
      }

      setRows(importedRows);
      setMessage(importedRows.length ? "Review every row before adding students." : "No student names were found in that file.");
    } catch (error) {
      setRows([]);
      setMessage(error instanceof Error ? error.message : "Could not read that file.");
    } finally {
      setWorking(false);
    }
  }

  function updateRow(id: string, field: keyof RosterDraft, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function importRows() {
    const validRows = rows.filter(rowIsValid);
    if (!validRows.length) return;
    setImporting(true);
    setMessage("");
    const result = await onImport(validRows);
    setImporting(false);
    if (result.errors.length) {
      setMessage(`${result.created} added. ${result.errors.length} could not be added: ${result.errors.join("; ")}`);
      return;
    }
    setMessage(`${result.created} student${result.created === 1 ? "" : "s"} added.`);
    setRows([]);
  }

  const invalidCount = rows.filter((row) => !rowIsValid(row)).length;

  return (
    <section className="mt-4 border border-emerald-200 bg-emerald-50/50 p-4" aria-label="Import class roster">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
            <Upload size={16} /> Import roster
          </div>
          <p className="mt-1 text-xs text-emerald-800/70">
            Upload a spreadsheet or a screenshot of printed roster text, then review the students before adding them.
          </p>
        </div>
        <button type="button" onClick={onClose} title="Close roster import" className="text-emerald-800/60 hover:text-emerald-900">
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs font-bold text-gray-600">
          Default school year
          <select value={defaultYear} onChange={(event) => setDefaultYear(event.target.value)} className="h-10 rounded-lg border border-emerald-200 bg-white px-3 text-sm text-gray-800">
            <option value="">Choose year</option>
            {SCHOOL_YEAR_LEVEL_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="hidden"
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={working} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50">
          {working ? <Sparkles size={16} className="animate-pulse" /> : <Upload size={16} />}
          {working ? "Reading roster..." : "Choose file"}
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <FileSpreadsheet size={15} /> CSV or Excel <span aria-hidden="true">·</span> <ImageIcon size={15} /> PNG, JPEG or WebP
        </span>
      </div>

      {fileName ? <p className="mt-2 text-xs font-semibold text-gray-500">{fileName}</p> : null}
      {message ? <p className="mt-2 text-xs font-semibold text-gray-700" role="status">{message}</p> : null}

      {rows.length > 0 ? (
        <div className="mt-4">
          <div className="overflow-x-auto border-y border-emerald-200">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-emerald-100/60 text-emerald-900">
                <tr>
                  <th className="px-2 py-2">First name *</th>
                  <th className="px-2 py-2">Last name</th>
                  <th className="px-2 py-2">School year *</th>
                  <th className="px-2 py-2">Username / ID</th>
                  <th className="px-2 py-2">Access code</th>
                  <th className="w-10 px-2 py-2"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 bg-white">
                {rows.map((row) => (
                  <tr key={row.id} className={rowIsValid(row) ? "" : "bg-red-50"}>
                    <td className="p-1.5"><input value={row.firstName} onChange={(event) => updateRow(row.id, "firstName", event.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5" /></td>
                    <td className="p-1.5"><input value={row.lastName} onChange={(event) => updateRow(row.id, "lastName", event.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5" /></td>
                    <td className="p-1.5">
                      <select value={row.schoolYear} onChange={(event) => updateRow(row.id, "schoolYear", event.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5">
                        <option value="">Choose year</option>
                        {SCHOOL_YEAR_LEVEL_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </td>
                    <td className="p-1.5"><input value={row.username} onChange={(event) => updateRow(row.id, "username", event.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5" /></td>
                    <td className="p-1.5"><input value={row.pin} inputMode="numeric" maxLength={4} onChange={(event) => updateRow(row.id, "pin", event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Generate" className="w-full rounded-md border border-gray-200 px-2 py-1.5" /></td>
                    <td className="p-1.5">
                      <button type="button" onClick={() => setRows((current) => current.filter((candidate) => candidate.id !== row.id))} title="Remove student" className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {rows.length} row{rows.length === 1 ? "" : "s"}{invalidCount ? ` · ${invalidCount} need attention` : " ready"}. Screenshot extraction reads text only; it does not identify faces.
            </p>
            <button type="button" onClick={importRows} disabled={importing || rows.length === invalidCount} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300">
              <UserPlus size={15} /> {importing ? "Adding students..." : `Add ${rows.length - invalidCount} students`}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
