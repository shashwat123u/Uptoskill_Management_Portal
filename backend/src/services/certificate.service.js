import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import Certificate from '../models/Certificate.js';
import CertificateRequest from '../models/CertificateRequest.js';
import CertificateTemplate from '../models/CertificateTemplate.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificatesDirectory = path.resolve(__dirname, '../../public/certificates');

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const createCertificateDraft = async (requestId) => {
  const request = await CertificateRequest.findById(requestId).populate('userId');
  if (!request) {
    throw new Error('Certificate request not found');
  }

  if (request.status !== 'approved') {
    throw new Error('Only approved requests can generate a certificate draft');
  }

  const user = request.userId;
  if (!user) {
    throw new Error('Request user not found');
  }

  const template = await CertificateTemplate.findOne({
    certificateType: request.certificateType,
    isActive: true,
  }).sort({ updatedAt: -1 });

  if (!template) {
    throw new Error('No active template found for this certificate type');
  }

  const payload = {
    title: template.title || template.name || 'Certificate',
    internName: user.fullName || 'Intern',
    internCode: user.internCode || request.internCode || '—',
    domain: user.domain || '—',
    startDate: formatDate(user.startDate),
    endDate: formatDate(user.endDate),
    issueDate: formatDate(new Date()),
    certificateType: request.certificateType || 'certificate',
    year: new Date().getFullYear(),
    requestNumber: request.requestNumber || '—',
  };

  const compiled = Handlebars.compile(template.htmlContent || template.content || '<div>Certificate draft</div>');
  const htmlContent = compiled(payload);

  const existing = await Certificate.findOne({ requestId });
  if (existing) {
    existing.htmlContent = htmlContent;
    existing.status = 'draft';
    existing.templateId = template._id;
    existing.userId = user._id;
    existing.internCode = user.internCode || request.internCode;
    existing.certificateType = request.certificateType;
    existing.domain = user.domain || '—';
    existing.startDate = user.startDate;
    existing.endDate = user.endDate;
    await existing.save();
    return existing;
  }

  const certificate = await Certificate.create({
    requestId: request._id,
    userId: user._id,
    internCode: user.internCode || request.internCode,
    templateId: template._id,
    certificateType: request.certificateType,
    domain: user.domain || '—',
    startDate: user.startDate,
    endDate: user.endDate,
    htmlContent,
    status: 'draft',
    generatedBy: request.reviewedBy || user._id,
  });

  request.certificateId = certificate._id;
  await request.save();

  return certificate;
};

export const finalizeCertificate = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId);
  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  if (certificate.status !== 'draft') {
    const error = new Error('Only draft certificates can be finalized');
    error.statusCode = 409;
    throw error;
  }

  if (!certificate.htmlContent || !certificate.htmlContent.trim()) {
    const error = new Error('Certificate htmlContent is empty');
    error.statusCode = 400;
    throw error;
  }

  const request = await CertificateRequest.findById(certificate.requestId);
  if (!request) {
    const error = new Error('Linked certificate request not found');
    error.statusCode = 409;
    throw error;
  }

  if (request.status !== 'approved') {
    const error = new Error('Linked certificate request is not approved');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.findById(certificate.userId);
  if (!user || !user.email) {
    const error = new Error('Certificate intern email not found');
    error.statusCode = 409;
    throw error;
  }

  await fs.mkdir(certificatesDirectory, { recursive: true });
  const fileName = `${certificate._id}.pdf`;
  const pdfPath = path.join(certificatesDirectory, fileName);
  const fileUrl = `/certificates/${fileName}`;
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(certificate.htmlContent, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await fs.writeFile(pdfPath, pdf);

    certificate.pdfPath = pdfPath;
    certificate.fileUrl = fileUrl;
    certificate.status = 'finalized';
    request.status = 'completed';

    await certificate.save();
    await request.save();

    return { certificate, request, user, pdfPath };
  } catch (error) {
    await fs.rm(pdfPath, { force: true });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const rollbackCertificateFinalization = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId);
  if (!certificate) return;

  const request = await CertificateRequest.findById(certificate.requestId);
  certificate.status = 'draft';
  certificate.pdfPath = undefined;
  certificate.fileUrl = undefined;
  certificate.emailSentAt = undefined;
  await certificate.save();

  if (request && request.status === 'completed') {
    request.status = 'approved';
    await request.save();
  }
};
