import { supabase } from './supabase';

export interface Artwork {
  id: string;
  artistId: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  medium?: string | null;
  dimensions?: string | null;
  imageUrl: string;
  imagePath: string | null;
  status: 'Available' | 'Sold';
  createdAt: string;
  updatedAt: string;
  artist?: {
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface CreateArtworkInput {
  title: string;
  description?: string;
  category: string;
  price: number;
  medium?: string;
  dimensions?: string;
  imageUrl: string;
  imagePath?: string;
}

export const ARTWORK_CATEGORIES = [
  'Pencil Art',
  'Sketches',
  'Mandala',
  'Portraits',
  'Traditional Art',
  'Abstract',
  'Digital Art',
  'Watercolors',
  'Oil Painting',
  'Concept Art',
  'Illustration'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

/**
 * Validate artwork input fields before submission
 */
export function validateArtworkInput(input: {
  title: string;
  description?: string;
  category: string;
  price: string | number;
  file?: File | null;
  imageUrl?: string;
}): { valid: boolean; error?: string } {
  if (!input.title || !input.title.trim()) {
    return { valid: false, error: 'Artwork title is required.' };
  }
  if (input.title.trim().length < 3) {
    return { valid: false, error: 'Artwork title must be at least 3 characters.' };
  }
  if (input.title.trim().length > 100) {
    return { valid: false, error: 'Artwork title must not exceed 100 characters.' };
  }

  if (!input.category || !input.category.trim()) {
    return { valid: false, error: 'Please select an artwork category.' };
  }

  const numericPrice = typeof input.price === 'number' ? input.price : parseFloat(input.price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return { valid: false, error: 'Please enter a valid price (greater than or equal to 0).' };
  }
  if (numericPrice > 10000000) {
    return { valid: false, error: 'Price exceeds maximum allowed valuation.' };
  }

  if (input.file) {
    if (!ALLOWED_IMAGE_TYPES.includes(input.file.type)) {
      return { 
        valid: false, 
        error: 'Unsupported image format. Please upload JPG, PNG, WEBP, or GIF.' 
      };
    }
    if (input.file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: 'Image file size exceeds the 10 MB limit. Please choose a smaller file.' 
      };
    }
  } else if (!input.imageUrl) {
    return { valid: false, error: 'Artwork image is required.' };
  }

  return { valid: true };
}

/**
 * Upload an artwork image file to the dedicated Supabase Storage bucket ('artworks')
 */
export async function uploadArtworkImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ imageUrl: string; imagePath: string }> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please verify your environment configuration.');
  }

  if (!userId) {
    throw new Error('User must be authenticated to upload artwork images.');
  }

  // Double check file validation
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds the 10 MB maximum size limit.');
  }

  // Create clean, unique file path: <userId>/<timestamp>-<sanitized-filename>
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${cleanName}.${fileExt}`;

  // Notify initial progress
  onProgress?.(15);

  const { error: uploadError } = await supabase.storage
    .from('artworks')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    if (uploadError.message.includes('Bucket not found') || (uploadError as any).statusCode === '404') {
      throw new Error(
        "Storage bucket 'artworks' was not found. Please run the SQL migration in your Supabase SQL Editor to create the 'artworks' bucket."
      );
    }
    if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
      throw new Error(
        "Upload failed due to storage permissions. Please ensure the 'artworks' storage RLS policies are applied in your Supabase dashboard."
      );
    }
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  onProgress?.(85);

  // Get public URL for the newly stored file
  const { data: urlData } = supabase.storage
    .from('artworks')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to resolve public image URL from Supabase storage.');
  }

  onProgress?.(100);

  return {
    imageUrl: urlData.publicUrl,
    imagePath: filePath
  };
}

/**
 * Save artwork metadata row into the database
 */
export async function createArtwork(
  input: CreateArtworkInput
): Promise<{ data: Artwork | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized.') };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { data: null, error: new Error('You must be signed in to publish artwork.') };
    }

    const currentUserId = sessionData.session.user.id;

    const payload = {
      artist_id: currentUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      price: typeof input.price === 'number' ? input.price : parseFloat(input.price),
      medium: input.medium?.trim() || null,
      dimensions: input.dimensions?.trim() || null,
      image_url: input.imageUrl,
      image_path: input.imagePath || null,
      status: 'Available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('artworks')
      .insert(payload)
      .select('*, profiles:artist_id(full_name, username, avatar_url)')
      .single();

    if (error) {
      console.error('Error inserting artwork row:', error);
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          data: null,
          error: new Error(
            "The 'artworks' table does not exist in your database yet. Please run the SQL migration in your Supabase SQL Editor."
          )
        };
      }
      return { data: null, error: new Error(error.message) };
    }

    const created: Artwork = {
      id: data.id,
      artistId: data.artist_id,
      title: data.title,
      description: data.description,
      category: data.category,
      price: Number(data.price),
      medium: data.medium,
      dimensions: data.dimensions,
      imageUrl: data.image_url,
      imagePath: data.image_path,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      artist: data.profiles ? {
        fullName: data.profiles.full_name || '',
        username: data.profiles.username || '',
        avatarUrl: data.profiles.avatar_url || null
      } : undefined
    };

    return { data: created, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch all published artworks belonging to an artist by user UUID
 */
export async function fetchArtworksByArtist(
  artistId: string
): Promise<{ data: Artwork[]; error: Error | null }> {
  if (!supabase || !artistId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, profiles:artist_id(full_name, username, avatar_url)')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully without crashing UI
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { data: [], error: null };
      }
      console.error('Error fetching artworks for artist:', error);
      return { data: [], error: new Error(error.message) };
    }

    const mapped: Artwork[] = (data || []).map((row: any) => ({
      id: row.id,
      artistId: row.artist_id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: Number(row.price),
      medium: row.medium,
      dimensions: row.dimensions,
      imageUrl: row.image_url,
      imagePath: row.image_path,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      artist: row.profiles ? {
        fullName: row.profiles.full_name || '',
        username: row.profiles.username || '',
        avatarUrl: row.profiles.avatar_url || null
      } : undefined
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
}

/**
 * Fetch total artwork count published by an artist
 */
export async function fetchArtworkCount(artistId: string): Promise<number> {
  if (!supabase || !artistId) return 0;

  try {
    const { count, error } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Update an existing artwork owned by the authenticated user
 */
export async function updateArtwork(
  artworkId: string,
  updates: Partial<CreateArtworkInput & { status: 'Available' | 'Sold' }>
): Promise<{ data: Artwork | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized.') };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { data: null, error: new Error('You must be signed in to edit artwork.') };
    }

    const currentUserId = sessionData.session.user.id;

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.price !== undefined) {
      payload.price = typeof updates.price === 'number' ? updates.price : parseFloat(updates.price as string);
    }
    if (updates.medium !== undefined) payload.medium = updates.medium?.trim() || null;
    if (updates.dimensions !== undefined) payload.dimensions = updates.dimensions?.trim() || null;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.imagePath !== undefined) payload.image_path = updates.imagePath;

    const { data, error } = await supabase
      .from('artworks')
      .update(payload)
      .eq('id', artworkId)
      .eq('artist_id', currentUserId)
      .select('*, profiles:artist_id(full_name, username, avatar_url)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: {
        id: data.id,
        artistId: data.artist_id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: Number(data.price),
        medium: data.medium,
        dimensions: data.dimensions,
        imageUrl: data.image_url,
        imagePath: data.image_path,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        artist: data.profiles ? {
          fullName: data.profiles.full_name || '',
          username: data.profiles.username || '',
          avatarUrl: data.profiles.avatar_url || null
        } : undefined
      },
      error: null
    };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Delete an artwork record and its corresponding storage file
 */
export async function deleteArtwork(
  artworkId: string,
  imagePath?: string | null
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase client is not initialized.') };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { success: false, error: new Error('You must be signed in to delete artwork.') };
    }

    const currentUserId = sessionData.session.user.id;

    // 1. Delete from database (RLS ensures user can only delete their own)
    const { error: dbError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)
      .eq('artist_id', currentUserId);

    if (dbError) {
      return { success: false, error: new Error(dbError.message) };
    }

    // 2. Best-effort delete from storage bucket if path is provided
    if (imagePath) {
      try {
        await supabase.storage.from('artworks').remove([imagePath]);
      } catch (storageErr) {
        console.warn('Storage cleanup warning (ignored):', storageErr);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}
