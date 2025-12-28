'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface AvatarUploadProps {
    userId: string;
    url: string | null | undefined;
    onUpload: (url: string) => void;
    size?: number;
}

export default function AvatarUpload({ userId, url, onUpload, size = 150 }: AvatarUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Du måste välja en bild att ladda upp.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Callback to parent to update profile
            onUpload(data.publicUrl);

        } catch (error: any) {
            alert('Fel vid uppladdning: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative rounded-full overflow-hidden border-4 border-primary/20 hover:border-accent transition-all cursor-pointer group"
                style={{ width: size, height: size }}
                onClick={() => fileInputRef.current?.click()}
            >
                {url ? (
                    <Image
                        src={url}
                        alt="Avatar"
                        fill
                        className="object-cover group-hover:opacity-80 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-4xl text-primary/40 group-hover:text-accent group-hover:bg-surface/80 transition-all">
                        📷
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <div>
                <button
                    className="text-xs font-bold text-accent hover:text-white uppercase tracking-wider"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? 'Laddar upp...' : 'Ändra profilbild'}
                </button>
                <input
                    style={{ visibility: 'hidden', position: 'absolute' }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    ref={fileInputRef}
                />
            </div>
        </div>
    );
}
