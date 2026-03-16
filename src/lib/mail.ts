import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
}: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || "OnlineJobs"}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Email error:", error);
        throw error;
    }
};

export const sendJobApplicationNotification = async (employerEmail: string, jobTitle: string, freelancerName: string) => {
    return sendEmail({
        to: employerEmail,
        subject: `New Application for ${jobTitle}`,
        text: `${freelancerName} has applied for your job post: ${jobTitle}. Check your dashboard for details.`,
        html: `<b>${freelancerName}</b> has applied for your job post: <b>${jobTitle}</b>.<br><br><a href="${process.env.NEXTAUTH_URL}/dashboard">View Application</a>`
    });
};

export const sendJobApprovalNotification = async (employerEmail: string, jobTitle: string, jobId: string) => {
    return sendEmail({
        to: employerEmail,
        subject: `Your Job Post has been Approved: ${jobTitle}`,
        text: `Good news! Your job posting "${jobTitle}" has been approved by our moderation team and is now live on the platform.`,
        html: `<b>Good news!</b><br><br>Your job posting <b>${jobTitle}</b> has been approved by our moderation team and is now live on the platform.<br><br><a href="${process.env.NEXTAUTH_URL}/jobs/${jobId}">View your live job post</a>`
    });
};

export const sendJobRejectionNotification = async (employerEmail: string, jobTitle: string) => {
    return sendEmail({
        to: employerEmail,
        subject: `Update on your Job Post: ${jobTitle}`,
        text: `We regret to inform you that your recent job posting "${jobTitle}" has been rejected by our moderation team as it did not meet our platform guidelines.`,
        html: `<b>Update on your Job Post</b><br><br>We regret to inform you that your recent job posting <b>${jobTitle}</b> has been rejected by our moderation team as it did not meet our platform guidelines. Please review our posting rules and feel free to submit a revised version.`
    });
};
