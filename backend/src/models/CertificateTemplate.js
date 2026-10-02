import mongoose from "mongoose";
const certificateTemplateSchema = new mongoose.Schema(
{
    templateCode: {
        type: String,
        unique: true,
        trim: true
    },

    templateName: {
        type: String,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    certificateType: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    title: {
        type: String,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    content: {
        type: String
    },

    htmlContent: {
        type: String
    },

    placeholders: {
        type: [String],
        default: []
    },

    logoPath: {
        type: String
    },

    backgroundPath: {
        type: String
    },

    signaturePath: {
        type: String
    },

    version: {
        type: Number,
        default: 1
    },

    isActive: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        enum: ["draft", "active", "inactive", "archived"],
        default: "active",
        index: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
},
{
    timestamps: true
});
certificateTemplateSchema.pre("save", async function () {
    if (this.name && !this.templateName) {
        this.templateName = this.name;
    }
    if (this.templateName && !this.name) {
        this.name = this.templateName;
    }
    if (this.htmlContent && !this.content) {
        this.content = this.htmlContent;
    }
    if (this.content && !this.htmlContent) {
        this.htmlContent = this.content;
    }
    if (this.isModified("isActive")) {
        if (this.isActive && this.status !== "active") {
            this.status = "active";
        } else if (!this.isActive && this.status === "active") {
            this.status = "inactive";
        }
    }
    if (this.isModified("status")) {
        this.isActive = this.status === "active";
    }
    if (this.createdBy) {
        const userModel = mongoose.model("user");
        const creator = await userModel.findById(this.createdBy);
        if (!creator) throw new Error("createdBy does not reference an existing user");
    }
});

const certificateTemplateModel = mongoose.model(
    "certificate_template",
    certificateTemplateSchema
);

export default certificateTemplateModel;
