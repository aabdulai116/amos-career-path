import type { Metadata } from "next";
import { CourseTracker } from "@/components/course/CourseTracker";

export const metadata: Metadata = { title: "100 Days of Code" };

export default function CoursePage() {
  return (
    <div className="h-full overflow-y-auto">
      <CourseTracker />
    </div>
  );
}
