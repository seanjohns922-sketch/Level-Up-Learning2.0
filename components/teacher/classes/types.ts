export type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
  year_levels?: string[] | null;
  created_at: string;
  archived_at?: string | null;
  school_id?: string | null;
  school_name?: string | null;
  academic_year?: number | null;
  status?: string | null;
};

export type StudentRow = {
  id: string;
  display_name: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  class_id: string | null;
  pin?: string | null;
  qr_token?: string | null;
  year_level?: string | null;
  school_year_level?: string | null;
  working_level?: string | null;
  notes?: string | null;
  archived_at?: string | null;
};

export type SchoolDirectoryStudent = {
  id: string;
  name: string;
  yearLevel: string | null;
  username: string | null;
  explorerCode: string | null;
  classIds: string[];
  classes: string[];
  status: "active" | "archived";
};

export type StudentSortMode = "first_name" | "last_name" | "actual_year";

export type HomeAccess = "linked" | "waiting" | "school";

export type EditForm = {
  first_name: string;
  last_name: string;
  username: string;
  pin: string;
  school_year_level: string;
  notes: string;
};
