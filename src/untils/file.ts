export const getFileName = (filePath: string): string => {
  if (!filePath) return "";
  const fullName = filePath.replace(/^.*[\\/]/, ""); // lấy phần cuối
  const parts = fullName.split("_"); 
  if (parts.length > 1) {
    return parts.slice(1).join("_"); // bỏ uuid, giữ lại phần sau
  }
  return fullName;
};
