/**
 * Photo Gallery Component
 * Displays all uploaded progress photos
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';

interface PhotoGalleryProps {
    userId: string;
    onClose: () => void;
}

interface PhotoEntry {
    date: string;
    url: string | null;
}

export default function PhotoGallery({ userId, onClose }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const { data, error } = await supabase
                    .from('daily_logs')
                    .select('log_date, progress_photo_url')
                    .eq('user_id', userId)
                    .not('progress_photo_url', 'is', null)
                    .order('log_date', { ascending: false });

                if (error) throw error;

                setPhotos(
                    data.map((d) => ({
                        date: d.log_date,
                        url: d.progress_photo_url,
                    }))
                );
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [userId, supabase]);

    if (selectedPhoto) {
        return (
            <Modal isOpen={true} onClose={() => setSelectedPhoto(null)} title="FOTO">
                <div className="space-y-4">
                    <img
                        src={selectedPhoto}
                        alt="Progress foto"
                        className="w-full h-auto border-2 border-primary/20"
                    />
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                    >
                        ← TILLBAKA
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="MITT GALLERI">
            {loading ? (
                <div className="text-center py-12">
                    <div className="font-inter text-sm text-primary/60">Laddar...</div>
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="font-inter text-sm text-primary/80">
                        Inga foton uppladdade än
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {photos.map((photo, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedPhoto(photo.url)}
                                className="relative aspect-square overflow-hidden border-2 border-primary/20 hover:border-accent transition-colors"
                            >
                                <img
                                    src={photo.url || ''}
                                    alt={`Progress ${photo.date}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                    <div className="font-inter text-xs text-white">
                                        {new Date(photo.date).toLocaleDateString('sv-SE')}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                    >
                        STÄNG
                    </button>
                </div>
            )}
        </Modal>
    );
}
