import React from 'react';
import { AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface ErrorDisplayProps {
  message: string;
  language: Language;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, language }) => {
  const t = translations[language];
  return (
    <div className="max-w-2xl mx-auto mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{t.attention}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;