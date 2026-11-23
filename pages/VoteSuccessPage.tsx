// web/pages/VoteSuccessPage.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Page } from '../types';

interface VoteSuccessPageProps {
  verificationCode: string;
  setPage: (page: Page) => void;
}

const VoteSuccessPage: React.FC<VoteSuccessPageProps> = ({ verificationCode, setPage }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      alert('Copy failed — please select and copy manually.');
      return false;
    }
  };

  const handleCopyAndVerify = async () => {
    if (await copyCode()) {
      setPage(Page.Verification);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Card className="max-w-lg mx-auto p-8">
        <svg
          className="w-20 h-20 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-dmi-blue-900 mb-6">
          Vote Submitted Successfully!
        </h2>

        <p className="text-gray-700 mb-8">
          Your vote has been recorded. Here is your verification code:
        </p>

        <div className="bg-gray-100 p-6 rounded-lg mb-8 font-mono text-2xl tracking-wider text-dmi-blue-800 break-all">
          {verificationCode}
        </div>

        <div className="space-y-4">
          <Button onClick={handleCopyAndVerify} className="w-full">
            Copy &amp; Verify
          </Button>

          <Button onClick={copyCode} variant="secondary" className="w-full">
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>

          <Button onClick={() => window.print()} variant="secondary" className="w-full">
            Print Page
          </Button>

          <Button onClick={() => setPage(Page.Home)} className="w-full">
            Return to Home
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Save this code — you will not see it again.
        </p>
      </Card>
    </div>
  );
};

export default VoteSuccessPage;