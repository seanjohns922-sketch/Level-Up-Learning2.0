import PatternPeaksEntry from "@/components/pattern-peaks/PatternPeaksEntry";

type PatternPeaksPageProps = {
  searchParams: Promise<{ level?: string }>;
};

export default async function PatternPeaksPage({ searchParams }: PatternPeaksPageProps) {
  const params = await searchParams;
  return <PatternPeaksEntry requestedLevel={params.level} />;
}
