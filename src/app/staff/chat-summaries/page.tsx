'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { mockPatients } from '@/lib/mock-data';
import { Patient, ChatMessage, ChatSummary } from '@/types';

// モック相談データ
const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    patient_id: 'patient-001',
    role: 'user',
    content: '歯が痛いのですが、どうしたらいいでしょうか？',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    patient_id: 'patient-001',
    role: 'assistant',
    content: 'お痛みの症状についてお聞かせください。どちらの歯が痛みますか？また、痛みはいつ頃から始まりましたか？',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString()
  },
  {
    id: '3',
    patient_id: 'patient-001',
    role: 'user',
    content: '右上の奥歯です。昨日の夜から痛み始めました。冷たいものを飲むと特に痛みます。',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString()
  },
  {
    id: '4',
    patient_id: 'patient-002',
    role: 'user',
    content: '歯ぐきから血が出るのですが、大丈夫でしょうか？',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockChatSummaries: ChatSummary[] = [
  {
    id: '1',
    patient_id: 'patient-001',
    summary_text: '患者は右上奥歯の痛みを訴えており、冷刺激で増悪する症状を呈している。昨夜から症状が開始。虫歯の可能性が高く、早期の診察が推奨される。',
    generated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    generated_by: 'staff-001'
  }
];

export default function StaffChatSummariesPage() {
  const router = useRouter();
  const { user, staff } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'staff' || !staff) {
      router.push('/staff/login');
      return;
    }
    
    setPatients(mockPatients);
    setChatMessages(mockChatMessages);
    setChatSummaries(mockChatSummaries);
  }, [user, staff, router]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_number.includes(searchTerm)
  );

  const getPatientChatMessages = (patientId: string) => {
    return chatMessages.filter(msg => msg.patient_id === patientId);
  };

  const getPatientSummaries = (patientId: string) => {
    return chatSummaries.filter(summary => summary.patient_id === patientId);
  };

  const generateSummary = async () => {
    if (!selectedPatient || !staff) return;

    setIsGeneratingSummary(true);
    
    // 実際の実装では、OpenAI APIを使用して要約を生成
    await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション

    const messages = getPatientChatMessages(selectedPatient.id);
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? '患者' : 'AI'}: ${msg.content}`
    ).join('\n');

    const newSummary: ChatSummary = {
      id: Date.now().toString(),
      patient_id: selectedPatient.id,
      summary_text: `${selectedPatient.name}さんとの相談内容の要約: ${conversationText.substring(0, 200)}...（実際の実装では、OpenAI APIで生成された要約が入ります）`,
      generated_at: new Date().toISOString(),
      generated_by: staff.id
    };

    setChatSummaries([...chatSummaries, newSummary]);
    setIsGeneratingSummary(false);
    alert('要約を生成しました');
  };

  if (!user || !staff) {
    return null;
  }

  return (
    <Layout 
      title="相談履歴・要約"
      showBackButton={true}
      backUrl="/staff/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">相談履歴・要約</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 患者選択パネル */}
          <Card>
            <CardHeader>
              <CardTitle>患者選択</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="患者名、患者番号で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredPatients.map((patient) => {
                    const messageCount = getPatientChatMessages(patient.id).length;
                    const summaryCount = getPatientSummaries(patient.id).length;
                    
                    return (
                      <div
                        key={patient.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            患者番号: {patient.patient_number}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>相談: {messageCount / 2}件</span>
                            <span>要約: {summaryCount}件</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相談履歴パネル */}
          <Card>
            <CardHeader>
              <CardTitle>相談履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <p className="text-gray-500 text-center py-8">
                  患者を選択してください
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {getPatientChatMessages(selectedPatient.id).map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-50 border-l-4 border-blue-400'
                            : 'bg-gray-50 border-l-4 border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">
                            {message.role === 'user' ? '患者' : 'AI歯科医師'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                    
                    {getPatientChatMessages(selectedPatient.id).length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        相談履歴がありません
                      </p>
                    )}
                  </div>

                  {getPatientChatMessages(selectedPatient.id).length > 0 && (
                    <Button
                      onClick={generateSummary}
                      disabled={isGeneratingSummary}
                      className="w-full"
                    >
                      {isGeneratingSummary ? '要約生成中...' : 'AI要約を生成'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 要約パネル */}
          <Card>
            <CardHeader>
              <CardTitle>相談要約</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <p className="text-gray-500 text-center py-8">
                  患者を選択してください
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {getPatientSummaries(selectedPatient.id).map((summary) => {
                      const generatedBy = staff?.id === summary.generated_by ? 'あなた' : 'スタッフ';
                      
                      return (
                        <div
                          key={summary.id}
                          className="p-3 border rounded-lg bg-green-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-green-800">
                              AI要約
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(summary.generated_at).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {summary.summary_text}
                          </p>
                          <p className="text-xs text-gray-500">
                            生成者: {generatedBy}
                          </p>
                        </div>
                      );
                    })}
                    
                    {getPatientSummaries(selectedPatient.id).length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        要約がありません
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            プライバシーに関する注意事項
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 患者の相談内容は機密情報です。適切に管理してください</li>
            <li>• AI要約は参考情報として活用し、必要に応じて詳細な相談履歴も確認してください</li>
            <li>• 要約内容を他の患者や関係者以外と共有しないでください</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 