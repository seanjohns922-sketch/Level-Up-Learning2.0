"use client";

import { createContext, useContext } from "react";

/** True inside a Level 1 lesson, so shared cards can show the Level 1 look without touching other levels. */
export const Level1LookContext = createContext(false);
export const useLevel1Look = () => useContext(Level1LookContext);
