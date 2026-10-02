import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
{
    certificateNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "certificate_request",
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },

    internCode: {
        type: String,
        index: true
    },

    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        index: true
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "certificate_template"
    },

    certificateType: {
        type: String,
        trim: true
    },

    domain: {
        type: String,
        trim: true
    },

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    issuedDate: {
        type: Date,
        default: Date.now
    },

    htmlContent: {
        type: String
    },

    status: {
        type: String,
        enum: ["draft", "finalized", "generated", "issued", "revoked", "expired"],
        default: "draft",
        index: true
    },

    pdfPath: {
        type: String
    },

    fileUrl: {
        type: String
    },

    emailSentAt: {
        type: Date
    },

    verificationCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true
    },

    qrCodePath: {
        type: String
    },

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
},
{
    timestamps: true
});

certificateSchema.index({ issuedDate: -1, status: 1 });
certificateSchema.index({ certificateType: 1, status: 1 });

certificateSchema.pre("save", async function () {
    const userModel = mongoose.model("user");

    const user = await userModel.findById(this.userId);
    if (!user) throw new Error("userId does not reference an existing user");

    if (this.pdfPath && !this.fileUrl) {
        this.fileUrl = this.pdfPath;
    }
    if (this.fileUrl && !this.pdfPath) {
        this.pdfPath = this.fileUrl;
    }

    if (this.templateId) {
        const certificateTemplateModel = mongoose.model("certificate_template");
        const template = await certificateTemplateModel.findById(this.templateId);
        if (!template) throw new Error("templateId does not reference an existing certificate template");
    }

    if (this.requestId) {
        const certificateRequestModel = mongoose.model("certificate_request");
        const request = await certificateRequestModel.findById(this.requestId);
        if (!request) throw new Error("requestId does not reference an existing certificate request");
    }

    if (this.generatedBy) {
        const generator = await userModel.findById(this.generatedBy);
        if (!generator) throw new Error("generatedBy does not reference an existing user");
    }
});

const certificateModel = mongoose.model(
    "certificate",
    certificateSchema
);

export default certificateModel;
