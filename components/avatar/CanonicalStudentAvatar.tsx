"use client";

import StudentAvatar, {
  type StudentAvatarProps,
} from "@/components/avatar/StudentAvatar";
import { useCanonicalAvatarAppearance } from "@/lib/avatar-appearance";

type CanonicalStudentAvatarProps = Omit<StudentAvatarProps, "outfit"> & {
  studentId?: string | null;
};

export default function CanonicalStudentAvatar({
  studentId,
  height = 196,
  framing = "full",
  ...props
}: CanonicalStudentAvatarProps) {
  const appearance = useCanonicalAvatarAppearance(studentId);

  if (!appearance) {
    const sourceHeight = framing === "head" ? 106 : 220;
    const width = Math.round((height * 120) / sourceHeight);
    return <span aria-hidden style={{ display: "inline-block", width, height }} />;
  }

  return (
    <StudentAvatar
      {...props}
      height={height}
      framing={framing}
      outfit={appearance}
    />
  );
}
