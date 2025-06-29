'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { mockPatients } from '@/lib/mock-data';
import { Patient } from '@/types';

export default function StaffPatientsPage() {
  const router = useRouter();
  const { user, staff } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    patient_number: '',
    current_passcode: '',
    email: '',
    phone: '',
    birth_date: '',
    address: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'staff' || !staff) {
      router.push('/staff/login');
      return;
    }
    
    // モックデータを使用
    setPatients(mockPatients);
  }, [user, staff, router]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_number.includes(searchTerm)
  );

  const generatePatientNumber = () => {
    const num = Math.floor(Math.random() * 90000) + 10000;
    return num.toString();
  };

  const generatePasscode = () => {
    const num = Math.floor(Math.random() * 900000) + 100000;
    return num.toString();
  };

  const handleAddPatient = () => {
    if (!newPatient.name) {
      alert('名前は必須です');
      return;
    }

    const patient: Patient = {
      id: Date.now().toString(),
      name: newPatient.name,
      patient_number: newPatient.patient_number || generatePatientNumber(),
      current_passcode: newPatient.current_passcode || generatePasscode(),
      birth_date: newPatient.birth_date,
      clinic_id: 'hachi-dental-onojo',
      passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      email: newPatient.email,
      phone: newPatient.phone,
      address: newPatient.address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: '',
      patient_number: '',
      current_passcode: '',
      email: '',
      phone: '',
      birth_date: '',
      address: ''
    });
    setShowAddForm(false);
    alert('患者を追加しました');
  };

  const refreshPasscode = (patientId: string) => {
    const newPasscode = generatePasscode();
    setPatients(patients.map(patient =>
      patient.id === patientId
        ? { 
            ...patient, 
            current_passcode: newPasscode, 
            passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString() 
          }
        : patient
    ));
    alert(`パスコードを更新しました: ${newPasscode}`);
  };

  if (!user || !staff) {
    return null;
  }

  return (
    <Layout 
      title="患者管理"
      showBackButton={true}
      backUrl="/staff/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">患者管理</h1>
          <Button onClick={() => setShowAddForm(true)}>
            新規患者追加
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <Input
            type="text"
            placeholder="患者名、患者番号で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>新規患者追加</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    患者名 *
                  </label>
                  <Input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="田中太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <Input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    placeholder="tanaka@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    患者番号（空欄で自動生成）
                  </label>
                  <Input
                    type="text"
                    value={newPatient.patient_number}
                    onChange={(e) => setNewPatient({...newPatient, patient_number: e.target.value})}
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスコード（空欄で自動生成）
                  </label>
                  <Input
                    type="text"
                    value={newPatient.current_passcode}
                    onChange={(e) => setNewPatient({...newPatient, current_passcode: e.target.value})}
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <Input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    生年月日
                  </label>
                  <Input
                    type="date"
                    value={newPatient.birth_date}
                    onChange={(e) => setNewPatient({...newPatient, birth_date: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <Input
                    type="text"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    placeholder="福岡県大野城市..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddPatient}>
                  追加
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        患者番号: {patient.patient_number}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {patient.email && <p>メール: {patient.email}</p>}
                      {patient.phone && <p>電話: {patient.phone}</p>}
                      {patient.birth_date && <p>生年月日: {patient.birth_date}</p>}
                      {patient.address && <p>住所: {patient.address}</p>}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        現在のパスコード: {patient.current_passcode}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        更新: {new Date(patient.updated_at).toLocaleString('ja-JP')}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        有効期限: {new Date(patient.passcode_expires_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshPasscode(patient.id)}
                    >
                      パスコード更新
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/staff/patients/${patient.id}`)}
                    >
                      詳細
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '検索条件に一致する患者が見つかりません' : '患者が登録されていません'}
          </div>
        )}
      </div>
    </Layout>
  );
} 