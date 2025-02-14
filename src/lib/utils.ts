
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ImageData {
  studentName: string;
  grade: string;
  title: string;
  type?: "ai" | "handdrawn";
  aiGenerator?: string;
  aiPrompt?: string;
  fromCheckDashboard?: boolean;
}

export function parseImageData(datefield: string): ImageData {
  try {
    return JSON.parse(datefield) as ImageData;
  } catch (e) {
    return {
      studentName: "Unknown",
      grade: "Unknown",
      title: "Unknown",
      type: "handdrawn", // default to hand drawn if not specified
      fromCheckDashboard: false
    };
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}
