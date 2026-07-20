import { redirect } from "next/navigation";

// The Collection Journal has been folded into the Gem Vault as its
// "Discoveries" view. Keep this route as a redirect for old links/bookmarks.
export default function CollectionsPage() {
  redirect("/gem-vault");
}
