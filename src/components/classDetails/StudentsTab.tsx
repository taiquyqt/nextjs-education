"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

interface Student {
  id: number
  username: string
  fullName: string
  email: string
  joinedAt: string
}

interface StudentsTabProps {
  students: Student[]
  user: { role: string }
}

export const StudentsTab = ({ students, user }: StudentsTabProps) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Danh sách học sinh ({students.length})</h3>
      {/* {user.role === "teacher" && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Mời học sinh
        </Button>
      )} */}
      <Button>
          <Plus className="h-4 w-4 mr-2" />
          Mời học sinh
        </Button>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Học sinh</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ngày tham gia</TableHead>
            {/* <TableHead>Điểm TB</TableHead> */}
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.fullName}</span>
                </div>
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{new Date(student.joinedAt).toLocaleDateString("vi-VN")}</TableCell>
              {/* <TableCell>
                <Badge variant={student.avgGrade >= 8 ? "default" : "secondary"}>{student.avgGrade}</Badge>
              </TableCell> */}
              <TableCell>
                <Badge className="bg-green-500">Hoạt động</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
)
