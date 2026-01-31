import { supabase } from './supabaseClient';

export const getPublicImageUrl = (bucket, path) => {
  if (!bucket || !path) {
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
};
