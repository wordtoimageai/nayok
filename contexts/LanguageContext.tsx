/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'bn';

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const translations: Translations = {
  // Start Screen
  aiPowered: { en: 'AI Powered Fashion', bn: 'এআই চালিত ফ্যাশন' },
  yourStyle: { en: 'Your Style,', bn: 'আপনার স্টাইল,' },
  perfected: { en: 'Perfected.', bn: 'নিখুঁত।' },
  startDescription: { 
    en: 'Experience the future of dressing. Upload a photo to create your digital twin and try on any outfit instantly. No more guessing, just pure style.',
    bn: 'পোশাক পরার ভবিষ্যৎ অভিজ্ঞতা নিন। আপনার ডিজিটাল টুইন তৈরি করতে একটি ছবি আপলোড করুন এবং তাৎক্ষণিকভাবে যেকোনো পোশাক ট্রাই করুন। আর কোনো অনুমান নয়, শুধু বিশুদ্ধ স্টাইল।'
  },
  startTransformation: { en: 'Start Your Transformation', bn: 'আপনার রূপান্তর শুরু করুন' },
  bestResults: { en: '✨ Best results with a clear, full-body photo.', bn: '✨ পরিষ্কার, পুরো শরীরের ছবির সাথে সেরা ফলাফল।' },
  responsibleAi: { en: 'Responsible AI • Creative Use Only', bn: 'দায়িত্বশীল এআই • শুধুমাত্র সৃজনশীল ব্যবহার' },
  
  // Wardrobe
  wardrobe: { en: 'Wardrobe', bn: 'ওয়ারড্রোব' },
  garments: { en: 'Garments', bn: 'পোশাক' },
  hats: { en: 'Hats', bn: 'টুপি' },
  sunglasses: { en: 'Sunglasses', bn: 'সানগ্লাস' },
  bags: { en: 'Bags', bn: 'ব্যাগ' },
  other: { en: 'Other', bn: 'অন্যান্য' },
  upload: { en: 'Upload', bn: 'আপলোড করুন' },
  noItemsFound: { en: 'No items found.', bn: 'কোনো আইটেম পাওয়া যায়নি।' },
  
  // Lookbook
  lookbook: { en: 'Lookbook', bn: 'লুকবুক' },
  yourLookbook: { en: 'Your Lookbook', bn: 'আপনার লুকবুক' },
  lookbookDescription: { en: 'A collection of your styled masterpieces', bn: 'আপনার স্টাইল করা মাস্টারপিসগুলোর একটি সংগ্রহ' },
  lookbookEmpty: { en: 'Your lookbook is empty', bn: 'আপনার লুকবুক খালি' },
  lookbookEmptySub: { en: 'Save your favorite outfits to see them here.', bn: 'আপনার প্রিয় পোশাকগুলো এখানে দেখতে সেভ করুন।' },
  saveToLookbook: { en: 'Save to Lookbook', bn: 'লুকবুক-এ সেভ করুন' },
  tipDownload: { en: 'Tip: You can download your favorite looks to share them with friends!', bn: 'টিপ: আপনি আপনার প্রিয় লুকগুলো বন্ধুদের সাথে শেয়ার করতে ডাউনলোড করতে পারেন!' },
  
  // Canvas & App
  startOver: { en: 'Start Over', bn: 'আবার শুরু করুন' },
  changingPose: { en: 'Changing pose...', bn: 'ভঙ্গি পরিবর্তন করা হচ্ছে...' },
  processing: { en: 'Processing...', bn: 'প্রক্রিয়াকরণ করা হচ্ছে...' },
  pose: { en: 'Pose', bn: 'ভঙ্গি' },
  error: { en: 'Error', bn: 'ত্রুটি' },
  
  // Footer
  about: { en: 'About', bn: 'সম্পর্কে' },
  privacy: { en: 'Privacy', bn: 'গোপনীয়তা' },
  terms: { en: 'Terms', bn: 'শর্তাবলী' },
  remixIdea: { en: 'Remix idea', bn: 'রিমিক্স আইডিয়া' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
