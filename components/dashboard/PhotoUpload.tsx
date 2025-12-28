/**
 * Photo Upload Component
 * Handles progress photo upload with camera integration
 */

'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';

interface PhotoUploadProps {
    userId: string;
    currentPhotoUrl: string | null;
    onPhotoUploaded: (url: string) => void;
    onClose: () => void;
}

export default function PhotoUpload({
    userId,
    currentPhotoUrl,
    onPhotoUploaded,
    onClose,
}: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        try {
            setUploading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            console.log('Uploading to:', fileName);

            const { data, error } = await supabase.storage
                .from('progress_photos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }

            console.log('Upload successful:', data);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('progress_photos')
                .getPublicUrl(data.path);

            console.log('Public URL:', urlData.publicUrl);

            // Call the callback with the URL
            await onPhotoUploaded(urlData.publicUrl);
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            alert('Kunde inte ladda upp foto. Försök igen.');
            setUploading(false);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="PROGRESS FOTO">
            <div className="space-y-6">
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover border-2 border-primary/20"
                        />
                    </div>
                ) : (
                    <div className="bg-surface border-2 border-primary/20 p-12 text-center">
                        <div className="text-6xl mb-4">📸</div>
                        <p className="font-inter text-sm text-primary/80">
                            Ta ett foto för att dokumentera din progress
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="space-y-3">
                    <button
                        onClick={handleCameraClick}
                        disabled={uploading}
                        className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50"
                    >
                        {uploading ? 'LADDAR UPP...' : '📷 TA FOTO'}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                    >
                        AVBRYT
                    </button>
                </div>
            </div>
        </Modal>
    );
}
