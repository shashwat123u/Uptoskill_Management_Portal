import { useEffect, useState } from 'react';
import { SubmitButton, StatusMessage } from './CreateIntern.jsx';

const CERTIFICATE_TYPES = [
  'offer_letter', 'bonafide', 'ojt_certificate', 'experience_letter',
  'completion_certificate', 'intern_of_month', 'league_winner', 'custom'
];

const DEFAULT_HTML = `<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2c3e50; margin-bottom: 10px;">UPTOSKILL</h1>
    <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px;">{{title}}</h2>
  </div>
  <div style="font-size: 16px; line-height: 1.8; color: #2c3e50;">
    <p>This is to certify that <strong>{{internName}}</strong>, with Intern Code: <strong>{{internCode}}</strong>, has been associated with Uptoskill.</p>
    <p>Department/Domain: <strong>{{domain}}</strong></p>
    <p>Duration: <strong>{{startDate}}</strong> to <strong>{{endDate}}</strong></p>
    <p style="margin-top: 30px;">During their tenure, {{internName}} demonstrated dedication, professionalism, and a strong work ethic.</p>
    <p style="margin-top: 40px;">We wish them the very best for all their future endeavours.</p>
  </div>
  <div style="margin-top: 60px; text-align: right;">
    <p style="font-weight: bold;">Authorized Signatory</p>
    <p style="color: #7f8c8d;">Uptoskill Management</p>
  </div>
</div>`;

const prettyType = (type) => type.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function TemplateForm({
  template,
  certificateTypes = CERTIFICATE_TYPES,
  onSubmit,
  onCancel,
  saving,
}) {
  const [values, setValues] = useState({
    name: '',
    certificateType: certificateTypes[0] || CERTIFICATE_TYPES[0],
    htmlContent: DEFAULT_HTML,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (template) {
      setValues({
        name: template.name || template.templateName || '',
        certificateType: template.certificateType || certificateTypes[0] || CERTIFICATE_TYPES[0],
        htmlContent: template.htmlContent || template.content || DEFAULT_HTML,
        description: template.description || '',
      });
    }
  }, [template, certificateTypes]);

  const handleChange = ({ target }) => {
    setValues((current) => ({ ...current, [target.name]: target.value }));
    setErrors((current) => ({ ...current, [target.name]: undefined }));
    setStatus(null);
  };

  const validate = (vals) => {
    const errs = {};
    if (!vals.name.trim()) errs.name = 'Template name is required.';
    if (!vals.certificateType) errs.certificateType = 'Certificate type is required.';
    if (!vals.htmlContent.trim()) errs.htmlContent = 'HTML content is required.';
    return errs;
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setStatus(null);
    try {
      await onSubmit({
        name: values.name.trim(),
        certificateType: values.certificateType,
        htmlContent: values.htmlContent,
        description: values.description.trim() || undefined,
      });
      if (!template) {
        setValues({
          name: '',
          certificateType: certificateTypes[0] || CERTIFICATE_TYPES[0],
          htmlContent: DEFAULT_HTML,
          description: '',
        });
      }
      setStatus({ type: 'success', message: template ? 'Template updated successfully.' : 'Template created successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || (template ? 'Unable to update template.' : 'Unable to create template.') });
    }
  };

  return (
    <section className="admin-form-panel">
      <div className="admin-form-heading">
        <span className="admin-form-icon">TPL</span>
        <div>
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <p>{template ? 'Update the certificate template content and settings.' : 'Define a new certificate template with HTML layout.'}</p>
        </div>
      </div>
      <form className="admin-form" onSubmit={submit} noValidate>
        <div className="admin-form-grid">
          <FormField
            label="Template name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. Offer Letter Standard"
          />
          <label className="admin-field">
            <span>Certificate type</span>
            <select
              name="certificateType"
              value={values.certificateType}
              onChange={handleChange}
              aria-invalid={Boolean(errors.certificateType)}
            >
              {certificateTypes.map((type) => (
                <option key={type} value={type}>{prettyType(type)}</option>
              ))}
            </select>
            {errors.certificateType && <small className="field-error">{errors.certificateType}</small>}
          </label>
        </div>
        <label className="admin-field">
          <span>Description (optional)</span>
          <input
            name="description"
            type="text"
            value={values.description}
            onChange={handleChange}
            placeholder="Brief note about when to use this template"
          />
        </label>
        <label className="admin-field">
          <span>{'HTML content (use {{internName}}, {{internCode}}, {{domain}}, {{startDate}}, {{endDate}}, {{title}} placeholders)'}</span>
          <textarea
            name="htmlContent"
            value={values.htmlContent}
            onChange={handleChange}
            rows={16}
            placeholder="<div>Certificate HTML here...</div>"
            aria-invalid={Boolean(errors.htmlContent)}
            style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }}
          />
          {errors.htmlContent && <small className="field-error">{errors.htmlContent}</small>}
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SubmitButton loading={saving} label={template ? 'Save changes' : 'Create template'} />
          {onCancel && (
            <button type="button" className="primary admin-submit" style={{ background: '#6c757d' }} onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
        {status && <StatusMessage status={status} />}
      </form>
    </section>
  );
}

function FormField({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
