'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { mockPatients } from '@/lib/mock-data';
import { Patient, TreatmentPlan, TreatmentPlanItem } from '@/types';

export default function StaffTreatmentPlansPage() {
  const router = useRouter();
  const { user, staff } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'staff' || !staff) {
      router.push('/staff/login');
      return;
    }
    
    setPatients(mockPatients);
  }, [user, staff, router]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_number.includes(searchTerm)
  );

  const createNewTreatmentPlan = () => {
    if (!selectedPatient || !staff) return;

    const newPlan: TreatmentPlan = {
      id: Date.now().toString(),
      patient_id: selectedPatient.id,
      created_by: staff.id,
      title: `${selectedPatient.name}さんの診療計画`,
      treatment_items: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTreatmentPlan(newPlan);
    setIsEditing(true);
  };

  const addTreatmentItem = () => {
    if (!treatmentPlan) return;

    const newItem: TreatmentPlanItem = {
      id: Date.now().toString(),
      treatment_item_id: 'temp-item',
      completed: false,
      order: treatmentPlan.treatment_items.length
    };

    setTreatmentPlan({
      ...treatmentPlan,
      treatment_items: [...treatmentPlan.treatment_items, newItem]
    });
  };

  const updateTreatmentItem = (itemId: string, field: keyof TreatmentPlanItem, value: string | boolean | number) => {
    if (!treatmentPlan) return;

    setTreatmentPlan({
      ...treatmentPlan,
      treatment_items: treatmentPlan.treatment_items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const removeTreatmentItem = (itemId: string) => {
    if (!treatmentPlan) return;

    setTreatmentPlan({
      ...treatmentPlan,
      treatment_items: treatmentPlan.treatment_items.filter(item => item.id !== itemId)
    });
  };

  const saveTreatmentPlan = () => {
    if (!treatmentPlan) return;

    // 実際の実装では、ここでSupabaseに保存
    alert('診療計画を保存しました');
    setIsEditing(false);
  };

  if (!user || !staff) {
    return null;
  }

  return (
    <Layout 
      title="診療計画管理"
      showBackButton={true}
      backUrl="/staff/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">診療計画管理</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            患者番号: {patient.patient_number}
                          </p>
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <div className="text-blue-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 診療計画編集パネル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                診療計画
                {selectedPatient && !treatmentPlan && (
                  <Button onClick={createNewTreatmentPlan}>
                    新規作成
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <p className="text-gray-500 text-center py-8">
                  患者を選択してください
                </p>
              ) : !treatmentPlan ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {selectedPatient.name}さんの診療計画はまだありません
                  </p>
                  <Button onClick={createNewTreatmentPlan}>
                    診療計画を作成
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{treatmentPlan.title}</h3>
                      <p className="text-sm text-gray-500">
                        ステータス: {
                          treatmentPlan.status === 'draft' ? '下書き' :
                          treatmentPlan.status === 'active' ? '実行中' : '完了'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          編集
                        </Button>
                      ) : (
                        <>
                          <Button onClick={saveTreatmentPlan}>
                            保存
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            キャンセル
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {treatmentPlan.treatment_items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-medium text-gray-500 mt-1">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  placeholder="治療項目ID"
                                  value={item.treatment_item_id}
                                  onChange={(e) => updateTreatmentItem(item.id, 'treatment_item_id', e.target.value)}
                                />
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  placeholder="備考"
                                  rows={2}
                                  value={item.notes || ''}
                                  onChange={(e) => updateTreatmentItem(item.id, 'notes', e.target.value)}
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium">{item.treatment_item_id || '（未設定）'}</p>
                                <p className="text-sm text-gray-600">{item.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => updateTreatmentItem(item.id, 'completed', e.target.checked)}
                                disabled={!isEditing}
                                className="mr-1"
                              />
                              <span className="text-sm">完了</span>
                            </label>
                            {isEditing && (
                              <button
                                onClick={() => removeTreatmentItem(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <Button variant="outline" onClick={addTreatmentItem} className="w-full">
                      治療項目を追加
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 