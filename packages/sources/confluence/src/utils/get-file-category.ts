type FileCategory =
  "изображение" | "документ" | "архив" | "аудио" | "видео" | "файл";

export function getFileCategory(filename: string): FileCategory {
  const ext = filename.toLowerCase().split(".").pop() || "";

  const imageExts = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "tiff",
    "ico",
  ];
  const docExts = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "md",
    "rtf",
  ];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2"];
  const audioExts = ["mp3", "wav", "ogg", "aac", "flac"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "mkv", "webm"];

  if (imageExts.includes(ext)) return "изображение";
  if (docExts.includes(ext)) return "документ";
  if (archiveExts.includes(ext)) return "архив";
  if (audioExts.includes(ext)) return "аудио";
  if (videoExts.includes(ext)) return "видео";

  return "файл";
}
