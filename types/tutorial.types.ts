export type TutorialLanguage = 'vi' | 'en' | 'es' | 'ko' | 'ru';
export type TutorialTone = 'friendly' | 'professional' | 'concise';
export type TutorialVoiceGender = 'female' | 'male';

export interface TutorialVoiceOption {
    id: string;
    name: string;
    gender: TutorialVoiceGender;
    language: TutorialLanguage;
    nativeName: string;
    description: string;
}

export const TUTORIAL_VOICE_OPTIONS: TutorialVoiceOption[] = [
    // Vietnamese
    {
        id: 'vi-VN-HoaiMyNeural',
        name: 'Hoài My',
        gender: 'female',
        language: 'vi',
        nativeName: 'Hoài My (Nữ)',
        description: 'Tự nhiên, truyền cảm, phù hợp video hướng dẫn & demo',
    },
    {
        id: 'vi-VN-NamMinhNeural',
        name: 'Nam Minh',
        gender: 'male',
        language: 'vi',
        nativeName: 'Nam Minh (Nam)',
        description: 'Rõ ràng, trầm ấm, chuẩn giọng giới thiệu sản phẩm',
    },
    // English
    {
        id: 'en-US-JennyNeural',
        name: 'Jenny',
        gender: 'female',
        language: 'en',
        nativeName: 'Jenny (US Female)',
        description: 'Friendly, warm, expressive, ideal for tutorials',
    },
    {
        id: 'en-US-GuyNeural',
        name: 'Guy',
        gender: 'male',
        language: 'en',
        nativeName: 'Guy (US Male)',
        description: 'Authoritative, clear, professional walkthrough tone',
    },
    // Spanish
    {
        id: 'es-ES-ElviraNeural',
        name: 'Elvira',
        gender: 'female',
        language: 'es',
        nativeName: 'Elvira (Español)',
        description: 'Cálida y clara para explicaciones paso a paso',
    },
    {
        id: 'es-ES-AlvaroNeural',
        name: 'Álvaro',
        gender: 'male',
        language: 'es',
        nativeName: 'Álvaro (Español)',
        description: 'Profesional y directo',
    },
    // Korean
    {
        id: 'ko-KR-SunHiNeural',
        name: 'Sun-Hi',
        gender: 'female',
        language: 'ko',
        nativeName: '선희 (Sun-Hi)',
        description: '친절하고 명확한 튜토리얼 음성',
    },
    {
        id: 'ko-KR-InJoonNeural',
        name: 'InJoon',
        gender: 'male',
        language: 'ko',
        nativeName: '인준 (InJoon)',
        description: '신뢰감 있는 프로페셔널 음성',
    },
    // Russian
    {
        id: 'ru-RU-SvetlanaNeural',
        name: 'Svetlana',
        gender: 'female',
        language: 'ru',
        nativeName: 'Светлана',
        description: 'Естественный и приятный голос для уроков',
    },
    {
        id: 'ru-RU-DmitryNeural',
        name: 'Dmitry',
        gender: 'male',
        language: 'ru',
        nativeName: 'Дмитрий',
        description: 'Четкий дикторский голос',
    },
];

export interface TutorialStep {
    id: string;
    startTime: number;
    endTime: number;
    duration?: number;
    narrationText: string;
    actionDescription: string;
    audioBlobUrl?: string;
    audioBlob?: Blob;
    status?: 'idle' | 'generating' | 'ready' | 'error';
    error?: string;
}

export interface TutorialScriptResult {
    title: string;
    summary: string;
    steps: TutorialStep[];
}
