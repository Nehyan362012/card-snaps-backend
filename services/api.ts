
import { Deck, Note, Test, UserStats, UserProfile, ChatSession, ThemeMode, ColorScheme } from '../types';
import { supabase } from './supabaseClient';

// API Base URL - can be overridden with VITE_API_BASE environment variable
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://card-snaps-backend.onrender.com');

export interface CommunityItem {
    id: string;
    type: 'deck' | 'note';
    title: string;
    description: string;
    author: string;
    data: Deck | Note;
    downloads: number;
    timestamp: number;
}

const SEED_COMMUNITY_DATA: CommunityItem[] = [
    {
        id: 'seed-1', type: 'deck', title: 'Biology: Cell Structure', description: 'Deep dive into organelles.', author: 'Dr. Science', downloads: 1242, timestamp: Date.now(),
        data: { id: 's1', title: 'Biology: Cell Structure', description: 'Deep dive into mitochondria.', cards: [
            {id:'c1', front:'What is the powerhouse of the cell?', back:'Mitochondria', color:'bg-green-100'},
            {id:'c2', front:'What controls what enters and leaves the cell?', back:'Cell Membrane', color:'bg-blue-100'}
        ], createdAt: Date.now() } as Deck
    }
];

export interface StoredUser extends UserProfile {
    id?: string;
    email?: string;
    themeMode?: ThemeMode;
    colorScheme?: ColorScheme;
    enableSeasonal?: boolean;
    created_at?: number;
}

class ApiService {
    private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE}/api${endpoint}`;
        
        // Get auth session and add to headers
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(url, {
            headers,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }

    async isAuthenticated() {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session?.user;
    }

    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async signOut() {
        await supabase.auth.signOut();
    }

    async register(email: string, password: string, name: string) {
        // This is now handled by Supabase Auth directly
        // This method is kept for backward compatibility but not used
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    display_name: name
                }
            }
        });
        
        if (error) throw error;
        return data.user;
    }

    async getMe(): Promise<StoredUser | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;
        
        return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            gradeLevel: 'Student'
        };
    }

    async saveProfile(profile: UserProfile) {
        // Update user metadata in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');
        
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: profile.name,
                display_name: profile.name,
                avatar_url: profile.avatar
            }
        });
        
        if (error) throw error;
        
        // Also save to backend for additional data
        return this.apiRequest('/profile', {
            method: 'POST',
            body: JSON.stringify(profile)
        });
    }

    async savePreferences(themeMode: string, colorScheme: string, enableSeasonal: boolean) {
        // Save preferences to Supabase user metadata
        const { error } = await supabase.auth.updateUser({
            data: {
                themeMode,
                colorScheme,
                enableSeasonal
            }
        });
        
        if (error) throw error;
    }

    async getDecks(): Promise<Deck[]> {
        return this.apiRequest<Deck[]>('/decks');
    }

    async createDeck(deck: Deck): Promise<Deck> {
        return this.apiRequest<Deck>('/decks', {
            method: 'POST',
            body: JSON.stringify(deck)
        });
    }

    async updateDeck(deck: Deck): Promise<Deck> {
        return this.apiRequest<Deck>(`/decks/${deck.id}`, {
            method: 'PUT',
            body: JSON.stringify(deck)
        });
    }

    async deleteDeck(id: string): Promise<void> {
        await this.apiRequest(`/decks/${id}`, {
            method: 'DELETE'
        });
    }

    async getNotes(): Promise<Note[]> {
        return this.apiRequest<Note[]>('/notes');
    }

    async saveNote(note: Note): Promise<Note> {
        return this.apiRequest<Note>('/notes', {
            method: 'POST',
            body: JSON.stringify(note)
        });
    }

    async updateNote(note: Note): Promise<Note> {
        return this.apiRequest<Note>(`/notes/${note.id}`, {
            method: 'PUT',
            body: JSON.stringify(note)
        });
    }

    async deleteNote(id: string): Promise<void> {
        await this.apiRequest(`/notes/${id}`, {
            method: 'DELETE'
        });
    }

    async getTests(): Promise<Test[]> {
        return this.apiRequest<Test[]>('/tests');
    }

    async addTest(test: Test): Promise<Test> {
        return this.apiRequest<Test>('/tests', {
            method: 'POST',
            body: JSON.stringify(test)
        });
    }

    async deleteTest(id: string): Promise<void> {
        await this.apiRequest(`/tests/${id}`, {
            method: 'DELETE'
        });
    }

    async getStats(): Promise<UserStats | null> {
        try {
            return await this.apiRequest<UserStats>('/stats');
        } catch {
            return null;
        }
    }

    async syncStats(stats: UserStats): Promise<UserStats> {
        return this.apiRequest<UserStats>('/stats', {
            method: 'POST',
            body: JSON.stringify(stats)
        });
    }

    async getChatSessions(): Promise<ChatSession[]> {
        return this.apiRequest<ChatSession[]>('/chats');
    }

    async saveChatSession(session: ChatSession): Promise<ChatSession> {
        return this.apiRequest<ChatSession>('/chats', {
            method: 'POST',
            body: JSON.stringify(session)
        });
    }

    async shareToCommunity(item: Deck | Note, type: 'deck' | 'note', authorName: string): Promise<void> {
        const sharedItem: CommunityItem = {
            id: crypto.randomUUID(),
            type,
            title: item.title,
            description: (item as any).description || (item as any).subject || 'No description',
            author: authorName,
            data: item,
            downloads: 0,
            timestamp: Date.now()
        };

        // For now, send to backend
        await this.apiRequest('/community', {
            method: 'POST',
            body: JSON.stringify(sharedItem)
        });
    }

    async getCommunityItems(): Promise<CommunityItem[]> {
        const backendItems = await this.apiRequest<CommunityItem[]>('/community');
        const allItems = [...backendItems, ...SEED_COMMUNITY_DATA];
        return allItems.sort((a,b) => b.timestamp - a.timestamp);
    }

    async likeCommunityItem(postId: string, userId: string): Promise<boolean> {
        const result = await this.apiRequest<{ liked: boolean }>(`/community/${postId}/like`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
        return result.liked;
    }

    async getCommunityComments(postId: string): Promise<any[]> {
        return this.apiRequest(`/community/${postId}/comments`);
    }

    async addCommunityComment(postId: string, userId: string, text: string): Promise<any> {
        return this.apiRequest(`/community/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ userId, text })
        });
    }

    async viewCommunityItem(postId: string, userId: string): Promise<void> {
        await this.apiRequest(`/community/${postId}/view`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async incrementDownload(communityId: string): Promise<void> {
        // This might need a separate endpoint
    }

    async generateDeck(prompt: string): Promise<{title: string, description: string, cards: any[]}> {
        return this.apiRequest('/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
    }
}

export const api = new ApiService();
