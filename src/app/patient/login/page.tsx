'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { loginPatient } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { PatientLoginForm } from '@/types';
import { validatePatientNumber, validatePasscode } from '@/lib/utils';
import Link from 'next/link';

export default function PatientLoginPage() {
  const router = useRouter();
  const { setUser, setPatient, setLoading, setError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<PatientLoginForm>();

  const onSubmit = async (data: PatientLoginForm) => {
    if (!validatePatientNumber(data.patient_number)) {
      setFormError('patient_number', {
        type: 'manual',
        message: '患者番号は5桁の数字で入力してください'
      });
      return;
    }

    if (!validatePasscode(data.passcode)) {
      setFormError('passcode', {
        type: 'manual',
        message: 'パスコードは6桁の数字で入力してください'
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const result = await loginPatient(data.patient_number, data.passcode);
      
      if (result.success && result.user && result.patient) {
        setUser(result.user);
        setPatient(result.patient);
        router.push('/patient/dashboard');
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      setError('ログインに失敗しました');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Layout 
      title="患者ログイン" 
      showHeader={false}
      showBackButton={true}
      backUrl="/"
      backLabel="トップページに戻る"
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              患者様ログイン
            </h1>
            <p className="text-sm text-gray-600">
              PlanBee - 歯科診療計画共有アプリ
            </p>
                         <p className="text-xs text-gray-500 mt-1">
               大野城はち歯科
             </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-center">ログイン情報を入力</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="患者番号"
                  type="text"
                  placeholder="00000"
                  {...register('patient_number', {
                    required: '患者番号を入力してください',
                    pattern: {
                      value: /^\d{5}$/,
                      message: '5桁の数字で入力してください'
                    }
                  })}
                  error={errors.patient_number?.message}
                  helperText="歯科衛生士から伝えられた5桁の患者番号を入力してください"
                />

                <Input
                  label="パスコード"
                  type="password"
                  placeholder="123456"
                  {...register('passcode', {
                    required: 'パスコードを入力してください',
                    pattern: {
                      value: /^\d{6}$/,
                      message: '6桁の数字で入力してください'
                    }
                  })}
                  error={errors.passcode?.message}
                  helperText="歯科衛生士から伝えられた6桁のパスコードを入力してください"
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  ログイン
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">ご利用について</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 患者番号とパスコードは歯科衛生士からお伝えします</li>
                  <li>• パスコードは60分ごとに自動更新されます</li>
                  <li>• ログイン情報をお忘れの場合は受付までお声がけください</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 text-sm">このアプリの機能</h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• 診療計画と治療スケジュールの確認</li>
                  <li>• 治療の進捗状況の確認</li>
                  <li>• AI歯科医師への24時間相談</li>
                  <li>• 治療に関する疑問の解決</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 