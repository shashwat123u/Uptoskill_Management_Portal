import { useCallback, useEffect, useState } from 'react';
import {
  createTemplate,
  getAllTemplates,
  updateTemplate,
  toggleTemplateActive,
} from '../services/admin.service';

const getErrorMessage = (error) => error.message || 'Unable to load templates.';

export default function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await getAllTemplates(params);
      setTemplates(data.templates || []);
      setCertificateTypes(data.certificateTypes || []);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const addTemplate = useCallback(async (payload) => {
    setSaving(true);
    try {
      const data = await createTemplate(payload);
      setTemplates((current) => [data.template, ...current]);
      setError(null);
      return data.template;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message, { cause: requestError });
    } finally {
      setSaving(false);
    }
  }, []);

  const editTemplate = useCallback(async (id, payload) => {
    setSaving(true);
    try {
      const data = await updateTemplate(id, payload);
      setTemplates((current) =>
        current.map((t) => (t._id === id ? data.template : t))
      );
      setError(null);
      return data.template;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message, { cause: requestError });
    } finally {
      setSaving(false);
    }
  }, []);

  const toggleActive = useCallback(async (id) => {
    try {
      const data = await toggleTemplateActive(id);
      setTemplates((current) =>
        current.map((t) => (t._id === id ? data.template : t))
      );
      setError(null);
      return data.template;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message, { cause: requestError });
    }
  }, []);

  useEffect(() => {
    const initialFetch = setTimeout(refetch, 0);
    return () => clearTimeout(initialFetch);
  }, [refetch]);

  return {
    templates,
    certificateTypes,
    loading,
    saving,
    error,
    refetch,
    addTemplate,
    editTemplate,
    toggleActive,
  };
}
