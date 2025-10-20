"use client";
import { useEffect, useState } from "react";
import StudentNotificationToast from "@/components/classDetails/StudentNotificationToast";
import TeacherNotificationBell from "@/components/classDetails/DropdownNotificationBell";
import { getCurrentUser } from "@/untils/utils";
import { get } from "http";
import TeacherNotificationToast from "../classDetails/TeacherNotificationToast";
import AssignmentNotificationToast from "../assignment/AssignmentNotificationToast";



interface JwtPayload {
  id: number;
  sub: string;
  roles: { name: string; id: number }[];
}

export default function Notification() {
  const [user, setUser] = useState<JwtPayload | null>(null);



  console.log("Current User:", user);
  console.log("User Role:", user?.id);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
}, []);

  if (user?.roles[0].name === "teacher") {
    return <TeacherNotificationToast teacherId={user.id} />;
  }

  if (user?.roles[0].name === "student") {
    return(
    <>
    <StudentNotificationToast studentId={user.id} />
    <AssignmentNotificationToast studentId={user.id}/>
    </>
    );
  }

  return null;
}