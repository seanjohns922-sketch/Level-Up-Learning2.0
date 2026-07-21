import type { ReactNode } from "react";

export default function RealmScene({ background, overlay, children }: { background: string; overlay: string; children: ReactNode }) {
  return (
    <section className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}>
      <div className="absolute inset-0" style={{ background: overlay }} aria-hidden="true" />
      {children}
    </section>
  );
}

