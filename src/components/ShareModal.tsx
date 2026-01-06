'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';
import { generateShareUrl, copyToClipboard, shareContent, generateQRCodeUrl } from '@/lib/share';
import { groupByCategory, exportAsText } from '@/lib/merge-engine';

interface ShareModalProps {
  items: GroceryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ items, isOpen, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'text' | 'qr'>('link');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Check for Web Share API support on client side
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setShareUrl(generateShareUrl(items));
    }
  }, [isOpen, items]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyText = async () => {
    const grouped = groupByCategory(items);
    const text = exportAsText(grouped);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const grouped = groupByCategory(items);
    const text = exportAsText(grouped);

    const shared = await shareContent({
      title: 'Grocery List',
      text: text,
      url: shareUrl,
    });

    if (!shared) {
      // Fallback to copy
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Grocery List
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('link')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'link'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Link
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'text'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'qr'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              QR Code
            </button>
          </div>

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share this link with others to share your grocery list:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>

              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share via...
                </button>
              )}
            </div>
          )}

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy the list as plain text:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {exportAsText(groupByCategory(items))}
                </pre>
              </div>
              <button
                onClick={handleCopyText}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          )}

          {/* QR Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to open the list:
              </p>
              <div className="flex justify-center">
                <img
                  src={generateQRCodeUrl(shareUrl)}
                  alt="QR Code for grocery list"
                  className="w-48 h-48 bg-white p-2 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500">
                {items.length} items in list
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
