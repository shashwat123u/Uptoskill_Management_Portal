import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useCertificateDraft from '../hooks/useCertificateDraft';
import { finalizeCertificate } from '../services/admin.service';
import Toast from '../../shared/components/Toast';

const SAMPLE_HTML = `
  <html>
    <body style="font-family: Arial, sans-serif; margin: 40px; color: #1f2937;">
      <div style="text-align:center; margin-bottom: 24px;">
        <h1 style="letter-spacing: 3px;">UPTOSKILL</h1>
        <h2>Certificate of Completion</h2>
      </div>
      <p>This is to certify that <strong>{{internName}}</strong> with intern code <strong>{{internCode}}</strong> has completed their internship in <strong>{{domain}}</strong>.</p>
      <p>Duration: <strong>{{startDate}}</strong> to <strong>{{endDate}}</strong>.</p>
      <p>Certificate Type: <strong>{{certificateType}}</strong></p>
      <div style="margin-top: 40px; text-align: right;">
        <p><strong>Authorized Signatory</strong></p>
        <p>Uptoskill Management</p>
      </div>
    </body>
  </html>
`;

export default function CertificateReviewPage() {
  const { id } = useParams();
  const { draft, loading, error, saving, updateDraft } = useCertificateDraft(id);
  const [certificateHtml, setCertificateHtml] = useState(SAMPLE_HTML);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizedCertificate, setFinalizedCertificate] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const actualHtml = draft?.htmlContent || certificateHtml;
  const certificateStatus = finalizedCertificate?.status || draft?.status;
  const isFinalized = certificateStatus === 'finalized';

  const iframeSource = useMemo(() => {
    const doc = actualHtml || SAMPLE_HTML;
    return `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`;
  }, [actualHtml]);

  useEffect(() => {
    if (draft?.htmlContent) {
      setCertificateHtml(draft.htmlContent);
    }
  }, [draft]);

  const handleSave = async () => {
    if (!id) return;
    setActionMessage(null);
    try {
      await updateDraft(certificateHtml);
    } catch (saveError) {
      // error is surfaced from the hook state; the catch keeps the UI responsive.
      console.error(saveError);
    }
  };

  const handleFinalize = async () => {
    const certificateId = draft?._id || id;
    if (!certificateId || finalizing || isFinalized) return;

    setFinalizing(true);
    setActionMessage(null);
    try {
      const response = await finalizeCertificate(certificateId);
      const certificate = response?.certificate;
      if (certificate?.status !== 'finalized') {
        throw new Error('Certificate finalization was not confirmed by the server.');
      }
      setFinalizedCertificate(certificate);
      setActionMessage({ type: 'success', text: 'Certificate finalized and sent successfully.' });
    } catch (finalizeError) {
      setActionMessage({ type: 'error', text: finalizeError.message || 'Unable to finalize certificate.' });
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c8aa5', margin: 0 }}>Certificate review</p>
          <h2 style={{ margin: '8px 0 0' }}>Draft certificate</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isFinalized && (
            <>
              <button type="button" onClick={handleSave} disabled={saving || loading || finalizing} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#2f6fed', color: '#fff', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save draft'}
              </button>
              <button type="button" onClick={handleFinalize} disabled={saving || loading || finalizing} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#15803d', color: '#fff', cursor: 'pointer' }}>
                {finalizing ? 'Finalizing...' : 'Finalize & Send'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Toast type="error">{error}</Toast>
      )}
      {actionMessage && <Toast type={actionMessage.type}>{actionMessage.text}</Toast>}
      {certificateStatus && <p style={{ margin: '0 0 20px', color: '#475569' }}>Status: <strong>{certificateStatus}</strong></p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div style={{ background: '#121826', border: '1px solid #2a3447', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #2a3447', fontWeight: 600 }}>Edit HTML</div>
          <textarea
            value={certificateHtml}
            onChange={(event) => setCertificateHtml(event.target.value)}
            disabled={isFinalized}
            rows={28}
            style={{ width: '100%', minHeight: 520, resize: 'vertical', border: 'none', background: '#0f172a', color: '#e2e8f0', padding: 16, fontFamily: 'Consolas, monospace', fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #dbe3ef', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #dbe3ef', fontWeight: 600, color: '#0f172a' }}>Preview</div>
          <div style={{ minHeight: 520, background: '#fff' }}>
            {loading ? (
              <div style={{ padding: 20, color: '#475569' }}>Loading draft…</div>
            ) : (
              <iframe title="Certificate preview" src={iframeSource} style={{ width: '100%', height: 560, border: 'none' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
