/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DownloadIcon, Share2Icon, Trash2Icon } from './icons';
import { LookbookEntry } from '../types';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LookbookEntry[];
  onRemove: (id: string) => void;
}

const LookbookModal: React.FC<LookbookModalProps> = ({ isOpen, onClose, entries, onRemove }) => {
  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `lookbook-outfit-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">Your Lookbook</h2>
                <p className="text-sm text-stone-500">A collection of your styled masterpieces</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {entries.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-stone-400">
                  <div className="w-16 h-16 mb-4 rounded-full bg-stone-50 flex items-center justify-center">
                    <Share2Icon className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-serif italic text-lg">Your lookbook is empty</p>
                  <p className="text-sm mt-1">Save your favorite outfits to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group relative bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={entry.imageUrl}
                          alt="Lookbook entry"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(entry.imageUrl, entry.id)}
                              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-colors"
                              title="Download Image"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemove(entry.id)}
                            className="p-2 bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 rounded-full text-red-200 transition-colors"
                            title="Remove from Lookbook"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {entry.items.map((item, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {entries.length > 0 && (
              <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-center">
                <p className="text-xs text-stone-400 italic">
                  Tip: You can download your favorite looks to share them with friends!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LookbookModal;
