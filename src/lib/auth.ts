import { supabase, supabaseAdmin } from './supabase';
import { Patient, Staff, AuthUser } from '@/types';
import { mockPatientLogin, mockStaffLogin } from './mock-data';
import crypto from 'crypto';

// 開発環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy-project.supabase.co';

// パスコード生成関数
export const generatePasscode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// パスコードの有効期限を設定（60分後）
export const getPasscodeExpiry = (): string => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 60);
  return expiry.toISOString();
};

// 患者ログイン
export const loginPatient = async (patientNumber: string, passcode: string): Promise<{ success: boolean; user?: AuthUser; patient?: Patient; error?: string }> => {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment) {
      const result = mockPatientLogin(patientNumber, passcode);
      if (result.success && result.patient) {
        const authUser: AuthUser = {
          id: result.patient.id,
          role: 'patient',
          patient_id: result.patient.id
        };
        return { success: true, user: authUser, patient: result.patient };
      } else {
        return { success: false, error: result.error };
      }
    }

    // 本番環境ではSupabaseを使用
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_number', patientNumber)
      .eq('current_passcode', passcode)
      .gt('passcode_expires_at', new Date().toISOString())
      .single();

    if (error || !patient) {
      return { success: false, error: '患者番号またはパスコードが正しくありません' };
    }

    // パスコードを自動更新
    const newPasscode = generatePasscode();
    const newExpiry = getPasscodeExpiry();
    
    await supabase
      .from('patients')
      .update({ 
        current_passcode: newPasscode,
        passcode_expires_at: newExpiry
      })
      .eq('id', patient.id);

    const authUser: AuthUser = {
      id: patient.id,
      role: 'patient',
      patient_id: patient.id
    };

    return { success: true, user: authUser, patient: { ...patient, current_passcode: newPasscode, passcode_expires_at: newExpiry } };
  } catch (error) {
    console.error('Patient login error:', error);
    return { success: false, error: 'ログインに失敗しました' };
  }
};

// Google認証でスタッフログイン
export const loginStaffWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // 開発環境ではモック認証を使用
    if (isDevelopment) {
      // 開発環境では直接コールバックページにリダイレクト
      window.location.href = '/staff/auth/callback?mock=true';
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/staff/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Google auth error:', error);
    return { success: false, error: 'Google認証に失敗しました' };
  }
};

// スタッフログイン
export const loginStaff = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; staff?: Staff; error?: string }> => {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment) {
      const result = mockStaffLogin(email, password);
      if (result.success && result.staff) {
        const authUser: AuthUser = {
          id: result.staff.id,
          email: result.staff.email,
          role: 'staff',
          staff_id: result.staff.id
        };
        return { success: true, user: authUser, staff: result.staff };
      } else {
        return { success: false, error: result.error };
      }
    }

    // 本番環境ではSupabaseを使用
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .eq('approved', true)
      .single();

    if (staffError || !staff) {
      return { success: false, error: '承認されていないアカウントです' };
    }

    const authUser: AuthUser = {
      id: authData.user.id,
      email: authData.user.email,
      role: 'staff',
      staff_id: staff.id
    };

    return { success: true, user: authUser, staff };
  } catch (error) {
    console.error('Staff login error:', error);
    return { success: false, error: 'ログインに失敗しました' };
  }
};

// スタッフ登録
export const registerStaff = async (name: string, email: string, password: string, clinicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // 開発環境では登録成功を返す
    if (isDevelopment) {
      return { success: true };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: '登録に失敗しました' };
    }

    const { error: staffError } = await supabase
      .from('staff')
      .insert({
        id: authData.user.id,
        name,
        email,
        clinic_id: clinicId,
        role: 'hygienist',
        approved: false
      });

    if (staffError) {
      return { success: false, error: 'スタッフ情報の登録に失敗しました' };
    }

    return { success: true };
  } catch (error) {
    console.error('Staff registration error:', error);
    return { success: false, error: '登録に失敗しました' };
  }
};

// 患者作成（スタッフ用）
export const createPatient = async (patientNumber: string, name: string, birthDate: string, clinicId: string): Promise<{ success: boolean; patient?: Patient; error?: string }> => {
  try {
    const passcode = generatePasscode();
    const expiresAt = getPasscodeExpiry();

    // 開発環境では成功を返す
    if (isDevelopment) {
      const patient: Patient = {
        id: `patient-${Date.now()}`,
        patient_number: patientNumber,
        name,
        birth_date: birthDate,
        clinic_id: clinicId,
        current_passcode: passcode,
        passcode_expires_at: expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { success: true, patient };
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        patient_number: patientNumber,
        name,
        birth_date: birthDate,
        clinic_id: clinicId,
        current_passcode: passcode,
        passcode_expires_at: expiresAt
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: '患者の登録に失敗しました' };
    }

    return { success: true, patient };
  } catch (error) {
    console.error('Create patient error:', error);
    return { success: false, error: '患者の登録に失敗しました' };
  }
};

// ログアウト
export const logout = async (): Promise<void> => {
  if (!isDevelopment) {
    await supabase.auth.signOut();
  }
}; 