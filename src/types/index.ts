// ユーザー関連の型定義
export interface Clinic {
  id: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  clinic_id: string;
  role: 'admin' | 'hygienist';
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  patient_number: string; // 00000-99999
  name: string;
  birth_date: string;
  clinic_id: string;
  current_passcode: string; // 6桁の数字
  passcode_expires_at: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// 診療計画関連の型定義
export interface TreatmentPlan {
  id: string;
  patient_id: string;
  created_by: string; // staff_id
  staff_name?: string; // 担当者名
  title?: string;
  notes?: string; // 治療方針・備考
  treatment_items: TreatmentPlanItem[];
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TreatmentPlanItem {
  id: string;
  treatment_item_id: string;
  tooth_number?: string; // 対象歯番号
  estimated_sessions?: number; // 予定回数
  scheduled_date?: string; // 予定日時 (ISO string)
  notes?: string; // 備考
  completed: boolean;
  completed_date?: string; // 完了日時 (ISO string)
  order: number;
  treatment_item?: TreatmentItem; // 治療項目の詳細情報
}

// チャット関連の型定義
export interface ChatMessage {
  id: string;
  patient_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSummary {
  id: string;
  patient_id: string;
  summary_text: string;
  generated_at: string;
  generated_by: string; // staff_id
}

// 認証関連の型定義
export interface AuthUser {
  id: string;
  email?: string;
  role: 'patient' | 'staff';
  patient_id?: string;
  staff_id?: string;
}

// フォーム関連の型定義
export interface PatientLoginForm {
  patient_number: string;
  passcode: string;
}

export interface StaffLoginForm {
  email: string;
  password: string;
}

export interface PatientProfileForm {
  name: string;
  birth_date: string;
}

export interface NewPatientForm {
  patient_number: string;
  name: string;
  birth_date: string;
}

// 治療項目関連の型定義
export interface TreatmentItem {
  id: string;
  clinic_id: string;
  internal_name: string; // 院内呼び方
  patient_name: string; // 患者様向け呼び方
  category?: string; // カテゴリ（例：予防、治療、外科など）
  description?: string; // 詳細説明
  order: number; // 表示順序
  active: boolean; // 有効/無効
  created_at: string;
  updated_at: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  order: number;
}

// CSV アップロード関連
export interface TreatmentCSVRow {
  internal_name: string;
  patient_name: string;
  category?: string;
  description?: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 