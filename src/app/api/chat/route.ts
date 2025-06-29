import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, patientId } = body;

    if (!message || !patientId) {
      return NextResponse.json(
        { error: 'メッセージと患者IDが必要です' },
        { status: 400 }
      );
    }

    // 患者の過去のチャット履歴を取得（最新10件）
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Chat history fetch error:', historyError);
    }

    // 履歴にユーザーメッセージを追加
    const messages = [
      ...(chatHistory || []),
      { role: 'user', content: message }
    ];

    // OpenAI APIを呼び出し
    const aiResponse = await createChatCompletion(messages);

    // ユーザーメッセージをDBに保存
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        patient_id: patientId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      });

    if (userMessageError) {
      console.error('User message save error:', userMessageError);
    }

    // AIレスポンスをDBに保存
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        patient_id: patientId,
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      });

    if (aiMessageError) {
      console.error('AI message save error:', aiMessageError);
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'チャット処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 