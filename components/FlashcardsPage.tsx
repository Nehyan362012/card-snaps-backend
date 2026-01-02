
import React, { useState } from 'react';
import { Deck } from '../types';
import { soundService } from '../services/soundService';
import { api } from '../services/api';
import { Plus, Play, Edit2, Trash2, Library, Share2, WalletCards, Loader2, Check, Link as LinkIcon } from 'lucide-react';

interface FlashcardsPageProps {
    decks: Deck[];
    onCreateDeck: () => void;
    onStudy: (deckId: string) => void;
    onEdit: (deckId: string) => void;
    onDelete: (e: React.MouseEvent, deckId: string) => void;
    onShare: (e: React.MouseEvent, deck: Deck) => void; 
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ decks, onCreateDeck, onStudy, onEdit, onDelete }) => {
    const [sharingId, setSharingId] = useState<string | null>(null);
    const [shareMode, setShareMode] = useState<'link' | 'code' | null>(null);

    const handleShare = async (e: React.MouseEvent, deck: Deck, mode: 'link' | 'code') => {
        e.stopPropagation();
        setSharingId(deck.id);
        setShareMode(mode);
        soundService.playClick();

        try {
            // Also "Publish" to local community so the user sees it there
            const user = await api.getMe();
            await api.shareToCommunity(deck, 'deck', user?.name || 'Me');

            if (mode === 'code') {
                const shareData = JSON.stringify(deck);
                await navigator.clipboard.writeText(shareData);
                soundService.playSuccess();
                alert("Deck JSON copied to clipboard! Share this text with a friend.");
            } else {
                // Generate URL Link
                const jsonStr = JSON.stringify(deck);
                const base64 = btoa(unescape(encodeURIComponent(jsonStr))); // UTF-8 safe base64
                const url = `${window.location.origin}/?import_deck=${base64}`;
                await navigator.clipboard.writeText(url);
                soundService.playSuccess();
                alert("Shareable Link copied! Anyone with this link can import your deck instantly.");
            }
        } catch (error: any) {
            console.error(error);
            alert("Failed to create share.");
        } finally {
            setTimeout(() => {
                setSharingId(null);
                setShareMode(null);
            }, 2000);
        }
    };

    return (
        <div className="p-6 md:p-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-2 flex items-center gap-4">
                        <WalletCards className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" /> Library
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">Manage all your study decks in one place.</p>
                </div>
                <button 
                    onClick={onCreateDeck}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Create Deck
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {decks.map((deck, index) => (
                    <div 
                        key={deck.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="glass-panel group relative rounded-[2rem] p-6 md:p-8 hover:bg-[var(--card-hover)] transition-all duration-500 hover:-translate-y-2 animate-pop-in flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6 shadow-inner">
                                <Library className="w-7 h-7" />
                            </div>
                            <div className="flex gap-1 md:gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                {/* Share Link Button */}
                                <button 
                                    onClick={(e) => handleShare(e, deck, 'link')} 
                                    className="p-2 text-[var(--text-tertiary)] hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors" 
                                    title="Copy Share Link"
                                >
                                    {sharingId === deck.id && shareMode === 'link' ? <Check className="w-4 h-4 text-emerald-500"/> : <LinkIcon className="w-4 h-4" />}
                                </button>
                                {/* Share Code Button */}
                                <button 
                                    onClick={(e) => handleShare(e, deck, 'code')} 
                                    className="p-2 text-[var(--text-tertiary)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors" 
                                    title="Copy JSON Code"
                                >
                                    {sharingId === deck.id && shareMode === 'code' ? <Check className="w-4 h-4 text-emerald-500"/> : <Share2 className="w-4 h-4" />}
                                </button>
                                
                                <button onClick={(e) => { e.stopPropagation(); onEdit(deck.id); }} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(e, deck.id); }} className="p-2 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors relative z-30"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2 md:mb-3 line-clamp-1 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => onStudy(deck.id)}>{deck.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-6 md:mb-8 flex-1 leading-relaxed font-medium">{deck.description || 'No description provided.'}</p>

                        <div className="mt-auto pt-6 border-t border-[var(--glass-border)]">
                            <button onClick={() => onStudy(deck.id)} className="w-full flex items-center justify-center gap-3 py-3 md:py-4 rounded-2xl bg-[var(--input-bg)] hover:bg-indigo-600 hover:text-white border border-[var(--glass-border)] hover:border-indigo-500/50 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 text-[var(--text-primary)]">
                                <Play className="w-4 h-4 fill-current" /> Study
                            </button>
                        </div>
                    </div>
                ))}
                
                {decks.length === 0 && (
                     <div className="col-span-full p-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--glass-border)] rounded-[3rem]">
                        <p className="text-xl font-bold mb-4">Your library is empty.</p>
                        <button onClick={onCreateDeck} className="text-indigo-500 font-bold hover:underline">Create a deck</button>
                     </div>
                )}
            </div>
        </div>
    );
};
