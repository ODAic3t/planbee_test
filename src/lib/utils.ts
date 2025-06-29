import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付フォーマット関数
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 時間フォーマット関数
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 患者番号のバリデーション（5桁の数字）
export const validatePatientNumber = (patientNumber: string): boolean => {
  const regex = /^\d{5}$/;
  return regex.test(patientNumber);
};

// パスコードのバリデーション（6桁の数字）
export const validatePasscode = (passcode: string): boolean => {
  const regex = /^\d{6}$/;
  return regex.test(passcode);
};

// メールアドレスのバリデーション
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}; 