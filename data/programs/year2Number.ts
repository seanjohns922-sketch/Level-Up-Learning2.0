import { buildProgram } from "./buildProgram";
import { year2NumberRows } from "./raw/year2NumberRows";

export const year2Number = buildProgram(2, "Number", year2NumberRows);
