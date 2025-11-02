import { useState } from 'react';
import { Lock, Unlock, Shield } from 'lucide-react';
import { encryptData, decryptData } from '../utills/encryptionService';

export default function EncryptionDemo() {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    setError('');
    try {
      if (!inputText.trim()) {
        setError('Please enter text to encrypt');
        return;
      }
      const encrypted = await encryptData(inputText);
      setEncryptedText(encrypted);
      setDecryptedText('');
    } catch (err) {
      setError('Encryption failed');
    }
  };

  const handleDecrypt = async () => {
    setError('');
    try {
      if (!encryptedText) {
        setError('No encrypted text to decrypt');
        return;
      }
      const decrypted = await decryptData(encryptedText);
      setDecryptedText(decrypted);
    } catch (err) {
      setError('Decryption failed');
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Data Encryption Demo</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            rows={3}
            placeholder="Enter sensitive data to encrypt..."
            maxLength={500}
          />
          <button
            onClick={handleEncrypt}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition"
          >
            <Lock className="w-4 h-4" />
            Encrypt
          </button>
        </div>

        {encryptedText && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encrypted Text
            </label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl font-mono text-sm break-all">
              {encryptedText}
            </div>
            <button
              onClick={handleDecrypt}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
            >
              <Unlock className="w-4 h-4" />
              Decrypt
            </button>
          </div>
        )}

        {decryptedText && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decrypted Text
            </label>
            <div className="w-full px-4 py-3 bg-green-50 border border-green-300 rounded-xl">
              {decryptedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}