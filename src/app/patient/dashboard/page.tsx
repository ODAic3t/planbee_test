'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

export default function PatientDashboardPage() {
  const router = useRouter();
  const { user, patient } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'patient' || !patient) {
      router.push('/patient/login');
    }
  }, [user, patient, router]);

  if (!user || !patient) {
    return null;
  }

  return (
    <Layout 
      title={`${patient.name}さんのページ`}
      showBackButton={true}
      backUrl="/"
      backLabel="トップページに戻る"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                こんにちは、{patient.name}さん
              </h2>
              <p className="text-blue-100 text-sm">
                PlanBee - はち歯科 大野城店
              </p>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-100">患者番号:</span>
                <span className="ml-2 font-semibold">{patient.patient_number}</span>
              </div>
              <div>
                <span className="text-blue-100">生年月日:</span>
                <span className="ml-2 font-semibold">{formatDate(patient.birth_date)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                診療計画の確認
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                次回の診療計画や治療内容を確認できます
              </p>
              <Link href="/patient/treatment-plan">
                <Button className="w-full">
                  診療計画を見る
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                歯科医師に相談
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                AI歯科医師に歯の悩みや疑問を相談できます
              </p>
              <Link href="/patient/chat">
                <Button variant="secondary" className="w-full">
                  相談する
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                プロフィール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                個人情報の確認・編集ができます
              </p>
              <Link href="/patient/profile">
                <Button variant="outline" className="w-full">
                  プロフィール設定
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                相談履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                過去の相談内容を確認できます
              </p>
              <Link href="/patient/chat/history">
                <Button variant="outline" className="w-full">
                  履歴を見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">重要なお知らせ</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• パスコードは60分ごとに自動更新されます</li>
            <li>• 緊急時は直接医院にお電話ください</li>
            <li>• AI相談は一般的なアドバイスのみです</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 