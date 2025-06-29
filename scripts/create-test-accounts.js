// テストアカウント作成スクリプト
// 本来はSupabaseデータベースに接続して作成しますが、
// 開発環境では静的なテストデータとして使用します

const testAccounts = {
  // テスト用クリニック
  clinic: {
    id: 'hachi-dental-onojo',
    name: 'はち歯科',
    location: '福岡県大野城市'
  },

  // テスト用患者アカウント
  patients: [
    {
      id: 'patient-001',
      patient_number: '12345',
      name: '田中太郎',
      birth_date: '1985-05-15',
      clinic_id: 'hachi-dental-onojo',
      current_passcode: '123456',
      passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1時間後
    },
    {
      id: 'patient-002', 
      patient_number: '54321',
      name: '佐藤花子',
      birth_date: '1990-08-22',
      clinic_id: 'hachi-dental-onojo',
      current_passcode: '654321',
      passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    },
    {
      id: 'patient-003',
      patient_number: '11111',
      name: '山田次郎',
      birth_date: '1978-12-03',
      clinic_id: 'hachi-dental-onojo',
      current_passcode: '111111',
      passcode_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  ],

  // テスト用スタッフアカウント
  staff: [
    {
      id: 'staff-001',
      name: '鈴木衛生士',
      email: 'suzuki@hachi-dental.com',
      clinic_id: 'hachi-dental-onojo',
      role: 'hygienist',
      approved: true,
      password: 'password123' // 実際のアプリではハッシュ化される
    },
    {
      id: 'staff-002',
      name: '高橋管理者',
      email: 'takahashi@hachi-dental.com', 
      clinic_id: 'hachi-dental-onojo',
      role: 'admin',
      approved: true,
      password: 'admin123'
    }
  ]
};

console.log('=== PlanBee テストアカウント ===\n');

console.log('🏥 クリニック情報:');
console.log(`医院名: ${testAccounts.clinic.name}`);
console.log(`所在地: ${testAccounts.clinic.location}\n`);

console.log('👤 患者テストアカウント:');
testAccounts.patients.forEach((patient, index) => {
  console.log(`${index + 1}. ${patient.name}`);
  console.log(`   患者番号: ${patient.patient_number}`);
  console.log(`   パスコード: ${patient.current_passcode}`);
  console.log(`   生年月日: ${patient.birth_date}`);
  console.log(`   有効期限: ${new Date(patient.passcode_expires_at).toLocaleString('ja-JP')}\n`);
});

console.log('👩‍⚕️ スタッフテストアカウント:');
testAccounts.staff.forEach((staff, index) => {
  console.log(`${index + 1}. ${staff.name} (${staff.role})`);
  console.log(`   メール: ${staff.email}`);
  console.log(`   パスワード: ${staff.password}`);
  console.log(`   承認済み: ${staff.approved ? 'はい' : 'いいえ'}\n`);
});

console.log('📝 ログイン手順:');
console.log('患者ログイン: http://localhost:3000/patient/login');
console.log('スタッフログイン: http://localhost:3000/staff/login');

module.exports = testAccounts; 