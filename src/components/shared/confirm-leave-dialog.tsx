"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmLeaveDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void; // Thêm prop này để xử lý từ bên ngoài
}

export function ConfirmLeaveDialog({
  open = false,
  onCancel,
  onConfirm,
}: ConfirmLeaveDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc muốn rời đi?</AlertDialogTitle>
          <AlertDialogDescription>
            Các thay đổi chưa lưu có thể bị mất. Hãy xác nhận trước khi rời
            trang.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Ở lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm} // Gọi hàm onConfirm được truyền vào
            className="bg-red-600 hover:bg-red-700"
          >
            Rời trang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}