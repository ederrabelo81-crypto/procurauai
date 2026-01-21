import { useEffect } from 'react';

interface DynamicMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

/**
 * Componente para meta tags dinâmicas
 * Melhora SEO e preview de compartilhamento no WhatsApp
 */
export function DynamicMeta({ 
  title, 
  description, 
  image,
  url,
  type = 'website'
}: DynamicMetaProps) {
  useEffect(() => {
    // Title
    document.title = `${title} | Procura UAI`;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Open Graph
    const updateOGMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOGMeta('og:title', title);
    updateOGMeta('og:description', description);
    updateOGMeta('og:type', type);
    
    if (image) {
      updateOGMeta('og:image', image);
    }
    
    if (url) {
      updateOGMeta('og:url', url);
    }

    // Twitter Card
    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateTwitterMeta('twitter:card', 'summary_large_image');
    updateTwitterMeta('twitter:title', title);
    updateTwitterMeta('twitter:description', description);
    
    if (image) {
      updateTwitterMeta('twitter:image', image);
    }

    // Cleanup
    return () => {
      document.title = 'Procura UAI';
    };
  }, [title, description, image, url, type]);

  return null;
}
