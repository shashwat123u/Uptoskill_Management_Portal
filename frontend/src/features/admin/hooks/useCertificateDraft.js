import { useCallback, useEffect, useState } from 'react';
import { getCertificateDraft, updateCertificateDraft } from '../services/admin.service';

const getErrorMessage = (error) => error.message || 'Unable to load certificate draft.';

export default function useCertificateDraft(id) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDraft = useCallback(async (targetId = id) => {
    if (!targetId) {
      setDraft(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCertificateDraft(targetId);
      const nextDraft = data?.certificate || null;
      setDraft(nextDraft);
      return nextDraft;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message, { cause: requestError });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateDraft = useCallback(async (htmlContent) => {
    if (!draft?._id && !id) {
      throw new Error('No certificate draft selected.');
    }

    setSaving(true);
    setError(null);

    try {
      const targetId = draft?._id || id;
      const data = await updateCertificateDraft(targetId, htmlContent);
      const nextDraft = data?.certificate || null;
      setDraft(nextDraft);
      return nextDraft;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message, { cause: requestError });
    } finally {
      setSaving(false);
    }
  }, [draft?._id, id]);

  useEffect(() => {
    if (!id) {
      setDraft(null);
      setLoading(false);
      setError(null);
      return;
    }

    const initialFetch = setTimeout(() => {
      fetchDraft(id);
    }, 0);

    return () => clearTimeout(initialFetch);
  }, [fetchDraft, id]);

  return {
    draft,
    loading,
    error,
    saving,
    fetchDraft,
    updateDraft,
  };
}
