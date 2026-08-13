export type SchoolLogo = {
  src: string;
  alt: string;
};

function normaliseSchoolKey(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getSchoolLogo(school: { name?: string | null; code?: string | null }): SchoolLogo | null {
  const nameKey = normaliseSchoolKey(school.name);
  const codeKey = normaliseSchoolKey(school.code);

  if (codeKey === "cob2026" || nameKey === "cobramprimary" || nameKey === "cobramprimaryschool") {
    return {
      src: "/schools/cobram-primary-logo.png",
      alt: `${school.name ?? "Cobram Primary"} logo`,
    };
  }

  if (
    codeKey === "stant2026"
    || nameKey === "stanthonyswanneroo"
    || nameKey === "stanthonyswannerooschool"
    || nameKey === "stanthonysprimaryschoolwanneroo"
  ) {
    return {
      src: "/schools/st-anthonys-wanneroo-logo.png",
      alt: `${school.name ?? "St Anthony's Wanneroo"} logo`,
    };
  }

  return null;
}
