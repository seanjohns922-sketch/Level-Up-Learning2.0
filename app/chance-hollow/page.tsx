import ChanceHollowEntry from "@/components/chance-hollow/ChanceHollowEntry";

type ChanceHollowPageProps = {
  searchParams: Promise<{ level?: string }>;
};

export default async function ChanceHollowPage({ searchParams }: ChanceHollowPageProps) {
  const params = await searchParams;
  return <ChanceHollowEntry requestedLevel={params.level} />;
}
