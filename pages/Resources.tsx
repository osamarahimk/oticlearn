
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { fetchLibraryResources } from '../services/backendService';
import { LibraryResource } from '../types';
import { Search, BookOpen, ExternalLink, Loader2, Globe, Bookmark } from 'lucide-react';
import { audio } from '../services/audioService';

export const Resources: React.FC = () => {
    const [query, setQuery] = useState('');
    const [resources, setResources] = useState<LibraryResource[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async (searchQ = '') => {
        setLoading(true);
        const data = await fetchLibraryResources(searchQ);
        setResources(data);
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        audio.playClick();
        loadResources(query);
    };

    return (
        <div className="space-y-8 animate-fade-in">
             {/* Hero Section */}
             <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-800 border border-white/10 p-10 shadow-xl text-white">
                <div className="relative z-10 max-w-3xl">
                    <h2 className="text-3xl font-bold mb-4">Academic Library Resources</h2>
                    <p className="text-blue-200 text-lg mb-8">
                        Access journals, research papers, and open textbooks from RENU, OpenLibrary, and partner universities across Uganda and beyond.
                    </p>
                    
                    <form onSubmit={handleSearch} className="relative max-w-xl">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search journals, authors, or topics..." 
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-xl py-4 pl-12 pr-4 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                        />
                        <Search className="absolute left-4 top-4 text-blue-200" />
                        <button type="submit" className="absolute right-2 top-2 bg-otic-orange px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-orange-600 transition-colors">
                            Search
                        </button>
                    </form>
                </div>
                <Globe className="absolute right-0 bottom-0 text-white opacity-5 w-64 h-64 -mr-10 -mb-10" />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <BookOpen className="text-otic-orange" />}
                    {query ? `Results for "${query}"` : "Recommended Resources"}
                </h3>
                
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading resources...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map(resource => (
                            <GlassCard key={resource.id} hoverEffect className="group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${resource.source === 'RENU' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-full">
                                        {resource.type}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{resource.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{resource.author} • {resource.year}</p>
                                <p className="text-xs font-mono text-otic-orange mb-4">{resource.source}</p>
                                
                                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                                    <a href={resource.url} className="flex-1 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-medium text-center text-gray-800 dark:text-white transition-colors flex items-center justify-center gap-2">
                                        Read Online <ExternalLink size={14} />
                                    </a>
                                    <button className="p-2 text-gray-400 hover:text-otic-orange transition-colors">
                                        <Bookmark size={20} />
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};