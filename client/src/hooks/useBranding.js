import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { getMediaUrl, updateFavicon } from '@/lib/utils';

export function useBranding(overrideSettings = null) {
  const [branding, setBranding] = useState({
    logoUrl: '',
    faviconUrl: '',
    globalSettings: null,
  });

  useEffect(() => {
    if (overrideSettings) {
      const logoUrl = getMediaUrl(overrideSettings.logo || overrideSettings.header?.logo || '');
      const faviconUrl = getMediaUrl(overrideSettings.favicon);
      setBranding({ logoUrl, faviconUrl, globalSettings: overrideSettings });
      if (faviconUrl) {
        updateFavicon(faviconUrl);
      }
      return;
    }

    let isMounted = true;
    api.fetchPublishedContent()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const settings = res.data.globalSettings || {};
          const logoUrl = getMediaUrl(settings.logo || res.data.header?.logo || '');
          const faviconUrl = getMediaUrl(settings.favicon);
          setBranding({ logoUrl, faviconUrl, globalSettings: settings });
          if (faviconUrl) {
            updateFavicon(faviconUrl);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load branding in useBranding:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [overrideSettings]);

  return branding;
}
