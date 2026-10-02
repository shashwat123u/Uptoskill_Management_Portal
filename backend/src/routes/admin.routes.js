import express from 'express';
import { registerValidator, teamLeaderValidator } from "../validators/auth.validator.js";
import {
  createIntern,
  createTeamLeader,
  getAllTeamLeaders,
  getInternsByTeamLeader,
  getForwardedRequests,
  finalizeRequest,
  createTemplate,
  getAllTemplates,
  updateTemplate,
  toggleTemplateActive,
  getCertificateDraftForRequest,
  updateCertificateDraftForRequest,
  getCertificateDraft,
  updateCertificateDraft,
  generateCertificateDraftForRequest,
  finalizeCertificateHandler,
  analyticsQueryValidator,
  getAdminAnalyticsOverview,
  getAdminAnalyticsRequestsTrend,
  getAdminAnalyticsCertificateTypes,
  getAdminAnalyticsTurnaround,
  getAdminAnalyticsTeamLeaders,
  getAdminAnalyticsDomains,
  getAdminAnalyticsPipeline,
  getAdminAnalyticsUpcomingCompletions,
  getAdminAnalyticsStuckRequests,
  exportAdminAnalytics,
} from "../controllers/admin.controller.js";
import verifyAuth from "../middlewares/verifyAuth.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const adminRouter = express.Router();


// POST api/auth/register-intern
adminRouter.post("/create-intern", verifyAuth, requireAdmin, registerValidator, createIntern);

// POST api/auth/register-tl
adminRouter.post("/create-tl", verifyAuth, requireAdmin, teamLeaderValidator, createTeamLeader);

adminRouter.get("/teamleaders", verifyAuth, requireAdmin, getAllTeamLeaders);

adminRouter.get("/teamleaders/:id/interns", verifyAuth, requireAdmin, getInternsByTeamLeader);

adminRouter.get("/forwarded-requests", verifyAuth, requireAdmin, getForwardedRequests);

adminRouter.patch("/requests/:id/finalize", verifyAuth, requireAdmin, finalizeRequest);

adminRouter.get("/certificates/:id", verifyAuth, requireAdmin, getCertificateDraft);
adminRouter.patch("/certificates/:id", verifyAuth, requireAdmin, updateCertificateDraft);
adminRouter.post("/certificates/:id/finalize", verifyAuth, requireAdmin, finalizeCertificateHandler);

// Certificate Template CRUD routes
adminRouter.post("/templates", verifyAuth, requireAdmin, createTemplate);
adminRouter.get("/templates", verifyAuth, requireAdmin, getAllTemplates);
adminRouter.patch("/templates/:id", verifyAuth, requireAdmin, updateTemplate);
adminRouter.patch("/templates/:id/toggle", verifyAuth, requireAdmin, toggleTemplateActive);

adminRouter.post("/requests/:id/generate-draft", verifyAuth, requireAdmin, generateCertificateDraftForRequest);

adminRouter.get('/analytics/overview', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsOverview);
adminRouter.get('/analytics/requests-trend', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsRequestsTrend);
adminRouter.get('/analytics/certificate-types', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsCertificateTypes);
adminRouter.get('/analytics/turnaround', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsTurnaround);
adminRouter.get('/analytics/team-leaders', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsTeamLeaders);
adminRouter.get('/analytics/domains', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsDomains);
adminRouter.get('/analytics/pipeline', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsPipeline);
adminRouter.get('/analytics/upcoming-completions', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsUpcomingCompletions);
adminRouter.get('/analytics/stuck-requests', verifyAuth, requireAdmin, analyticsQueryValidator, getAdminAnalyticsStuckRequests);
adminRouter.get('/analytics/export', verifyAuth, requireAdmin, analyticsQueryValidator, exportAdminAnalytics);

export default adminRouter;