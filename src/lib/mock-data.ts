// 開発環境用モックデータ
import { Patient, Staff, Clinic, TreatmentPlan, TreatmentItem } from '@/types';

export const mockClinic: Clinic = {
  id: 'hachi-dental-onojo',
  name: 'はち歯科',
  location: '福岡県大野城市',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockPatients: Patient[] = [
  {
    id: 'patient-001',
    patient_number: '12345',
    name: '田中太郎',
    birth_date: '1985-05-15',
    clinic_id: 'hachi-dental-onojo',
    current_passcode: '123456',
    passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'patient-002',
    patient_number: '54321',
    name: '佐藤花子',
    birth_date: '1990-08-22',
    clinic_id: 'hachi-dental-onojo',
    current_passcode: '654321',
    passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'patient-003',
    patient_number: '11111',
    name: '山田次郎',
    birth_date: '1978-12-03',
    clinic_id: 'hachi-dental-onojo',
    current_passcode: '111111',
    passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockStaff: Staff[] = [
  {
    id: 'staff-001',
    name: '鈴木衛生士',
    email: 'suzuki@hachi-dental.com',
    clinic_id: 'hachi-dental-onojo',
    role: 'hygienist',
    approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-002',
    name: '高橋管理者',
    email: 'takahashi@hachi-dental.com',
    clinic_id: 'hachi-dental-onojo',
    role: 'admin',
    approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-003',
    name: 'Google衛生士',
    email: 'test@gmail.com',
    clinic_id: 'hachi-dental-onojo',
    role: 'hygienist',
    approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 開発環境用のパスワード（実際はハッシュ化される）
export const mockPasswords: Record<string, string> = {
  'suzuki@hachi-dental.com': 'password123',
  'takahashi@hachi-dental.com': 'admin123'
};

// モックデータを使用した認証関数
export const mockPatientLogin = (patientNumber: string, passcode: string) => {
  const patient = mockPatients.find(p => 
    p.patient_number === patientNumber && p.current_passcode === passcode
  );
  
  if (patient && new Date(patient.passcode_expires_at) > new Date()) {
    return { success: true, patient };
  }
  
  return { success: false, error: '患者番号またはパスコードが正しくありません' };
};

export const mockStaffLogin = (email: string, password: string) => {
  const staff = mockStaff.find(s => s.email === email && s.approved);
  const correctPassword = mockPasswords[email];
  
  if (staff && correctPassword === password) {
    return { success: true, staff };
  }
  
  return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
};

// 治療項目のモックデータ
export const mockTreatmentItems: TreatmentItem[] = [
  {
    id: 'treatment-001',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'スケーリング',
    patient_name: '歯石除去・クリーニング',
    category: '予防',
    description: '歯石を除去し、歯の表面をきれいにします',
    order: 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'treatment-002',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'CR充填',
    patient_name: '虫歯の詰め物治療',
    category: '治療',
    description: '虫歯部分を削って、白い詰め物で修復します',
    order: 2,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'treatment-003',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'ルートプレーニング',
    patient_name: '歯周病治療（深いクリーニング）',
    category: '歯周病',
    description: '歯周ポケット内の歯石や細菌を除去します',
    order: 3,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'treatment-004',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'フッ素塗布',
    patient_name: 'フッ素塗布（虫歯予防）',
    category: '予防',
    description: '歯を強化し、虫歯を予防するフッ素を塗布します',
    order: 4,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'treatment-005',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'インレー',
    patient_name: '詰め物（インレー）',
    category: '治療',
    description: '大きな虫歯に対する詰め物治療です',
    order: 5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 治療計画のモックデータ
export const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: 'plan-001',
    patient_id: 'patient-001',
    created_by: 'staff-001',
    staff_name: '鈴木衛生士',
    notes: '初回検診の結果、軽度の歯周病と虫歯が見つかりました。まずは歯石除去から始めて、その後虫歯治療を行います。定期的なメンテナンスも重要です。',
    treatment_items: [
      {
        id: 'plan-item-001',
        treatment_item_id: 'treatment-001',
        tooth_number: '全体',
        estimated_sessions: 2,
        scheduled_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '上下顎の歯石除去を2回に分けて実施',
        completed: true,
        completed_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        order: 1
      },
      {
        id: 'plan-item-002',
        treatment_item_id: 'treatment-002',
        tooth_number: '16',
        estimated_sessions: 1,
        scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '右上第一大臼歯の虫歯治療',
        completed: true,
        completed_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        order: 2
      },
      {
        id: 'plan-item-003',
        treatment_item_id: 'treatment-003',
        tooth_number: '下顎前歯部',
        estimated_sessions: 3,
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '歯周ポケット4-5mmの部位',
        completed: false,
        order: 3
      },
      {
        id: 'plan-item-004',
        treatment_item_id: 'treatment-004',
        estimated_sessions: 1,
        scheduled_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '治療完了後の予防処置',
        completed: false,
        order: 4
      }
    ],
    status: 'active',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'plan-002',
    patient_id: 'patient-002',
    created_by: 'staff-001',
    staff_name: '鈴木衛生士',
    notes: '定期検診で虫歯が複数見つかりました。治療を段階的に進めていきます。',
    treatment_items: [
      {
        id: 'plan-item-005',
        treatment_item_id: 'treatment-001',
        tooth_number: '全体',
        estimated_sessions: 1,
        scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '定期クリーニング',
        completed: true,
        completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        order: 1
      },
      {
        id: 'plan-item-006',
        treatment_item_id: 'treatment-002',
        tooth_number: '26',
        estimated_sessions: 1,
        scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '左上第一大臼歯の小さな虫歯',
        completed: false,
        order: 2
      },
      {
        id: 'plan-item-007',
        treatment_item_id: 'treatment-005',
        tooth_number: '37',
        estimated_sessions: 2,
        scheduled_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '左下第二小臼歯の大きな虫歯',
        completed: false,
        order: 3
      }
    ],
    status: 'active',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]; 