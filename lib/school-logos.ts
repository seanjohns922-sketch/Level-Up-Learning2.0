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

  if (
    codeKey === "stpatssta2026"
    || nameKey === "stpatricksprimaryschoolstawell"
    || nameKey === "stpatricksschoolstawell"
    || nameKey === "stpatricksstawell"
  ) {
    return {
      src: "/schools/st-patricks-stawell-logo.jpg",
      alt: `${school.name ?? "St Patrick's Stawell"} logo`,
    };
  }

  if (
    nameKey === "stmarysthornbury"
    || nameKey === "stmarysschoolthornbury"
    || nameKey === "stmarysprimaryschoolthornbury"
    || nameKey === "stmarysthornburyprimaryschool"
    || nameKey === "stmarysparishprimaryschoolthornbury"
  ) {
    return {
      src: "/schools/st-marys-thornbury-logo.svg",
      alt: `${school.name ?? "St Mary's Thornbury"} logo`,
    };
  }

  return null;
}
