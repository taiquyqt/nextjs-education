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
import { useRouter } from "next/navigation";

export function ConfirmLeaveDialog({
  open = false,
  onCancel = () => {},
}: {
  open?: boolean;
  onCancel?: () => void;
}) {
  const router = useRouter();

  function handleConfirm() {
    router.back(); // quay lại trang trước
  }

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
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Rời trang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
