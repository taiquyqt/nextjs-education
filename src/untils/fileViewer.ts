export function handleViewFile(filePath: string, fileType: string) {
  if (!filePath) return;

  const directViewTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "text/html",
    "text/csv",
    "application/json",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (directViewTypes.includes(fileType)) {
    window.open(filePath, "_blank");
  } else {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(filePath)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  }
}
