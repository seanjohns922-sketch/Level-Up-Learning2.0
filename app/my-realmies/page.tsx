import { redirect } from "next/navigation";

// Preserve old bookmarks without loading the retired collection or its RPCs.
export default function RetiredCollectionPage() {
  redirect("/home-base");
}
