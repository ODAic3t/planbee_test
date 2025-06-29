import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-openai-key',
});

export const createChatCompletion = async (messages: { role: string; content: string }[]) => {
  try {
    // 開発環境でAPIキーが設定されていない場合はダミーレスポンスを返す
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-openai-key') {
      return 'こちらは開発環境用のダミーレスポンスです。実際のAI相談機能を使用するには、OpenAI APIキーを設定してください。';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `あなたは経験豊富な歯科医師です。患者からの歯科に関する相談に対して、専門的で分かりやすいアドバイスを提供してください。
          
重要な注意点：
- 診断は行わず、一般的な情報提供とアドバイスに留めてください
- 緊急性がある症状の場合は、すぐに歯科医院を受診するよう促してください
- 薬の処方や具体的な治療の指示は避けてください
- 丁寧で親しみやすい口調で回答してください
- 回答は日本語で行ってください`
        },
        ...messages.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'すみません、回答を生成できませんでした。';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'AI相談サービスは現在開発中です。実際の運用時にはOpenAI APIキーの設定が必要です。';
  }
};

export const generateChatSummary = async (chatHistory: { role: string; content: string }[]) => {
  try {
    // 開発環境でAPIキーが設定されていない場合はダミーレスポンスを返す
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-openai-key') {
      return '開発環境用のダミー要約です。実際の要約機能を使用するには、OpenAI APIキーを設定してください。';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `以下の患者とAI歯科医師の会話履歴を要約してください。以下の点に注意してください：

- 患者の主な症状や悩み
- 提供されたアドバイスの要点
- 今後の推奨事項
- 緊急性や重要な注意点

要約は歯科衛生士が読みやすい形式で、患者の状態を理解しやすいようまとめてください。`
        },
        {
          role: "user",
          content: chatHistory.map(msg => `${msg.role === 'user' ? '患者' : 'AI歯科医師'}: ${msg.content}`).join('\n\n')
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || '要約を生成できませんでした。';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return '要約生成機能は現在開発中です。';
  }
}; 