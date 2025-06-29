-- PlanBee データベーススキーマ
-- Supabaseで実行するSQL文

-- 1. クリニック（医院）テーブル
CREATE TABLE clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. スタッフテーブル
CREATE TABLE staff (
  id UUID PRIMARY KEY, -- Supabase Auth のユーザーIDを使用
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'hygienist' CHECK (role IN ('admin', 'hygienist')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. 患者テーブル
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_number VARCHAR(5) UNIQUE NOT NULL CHECK (patient_number ~ '^\d{5}$'),
  name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  current_passcode VARCHAR(6) NOT NULL CHECK (current_passcode ~ '^\d{6}$'),
  passcode_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. 診療計画テーブル
CREATE TABLE treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. 診療計画項目テーブル
CREATE TABLE treatment_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. チャットメッセージテーブル
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. チャット要約テーブル
CREATE TABLE chat_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT now(),
  generated_by UUID REFERENCES staff(id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_clinic ON staff(clinic_id);
CREATE INDEX idx_chat_messages_patient ON chat_messages(patient_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);

-- RLS（Row Level Security）ポリシー設定
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_summaries ENABLE ROW LEVEL SECURITY;

-- スタッフ用ポリシー（自分の所属クリニックのデータのみアクセス可能）
CREATE POLICY "staff_clinic_access" ON patients
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE id = auth.uid()
    )
  );

CREATE POLICY "staff_clinic_treatment_access" ON treatment_plans
  FOR ALL USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN staff s ON p.clinic_id = s.clinic_id
      WHERE s.id = auth.uid()
    )
  );

CREATE POLICY "staff_chat_access" ON chat_messages
  FOR ALL USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN staff s ON p.clinic_id = s.clinic_id
      WHERE s.id = auth.uid()
    )
  );

-- 初期データ投入
INSERT INTO clinics (id, name, location) VALUES 
('12345678-1234-1234-1234-123456789012', 'はち歯科', '福岡県大野城市');

-- 更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新トリガー設定
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 