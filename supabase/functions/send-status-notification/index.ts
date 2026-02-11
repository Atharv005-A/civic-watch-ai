import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  email: string;
  complaintId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  resolution?: string;
  assignedWorker?: string;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    investigating: '#3b82f6',
    'in-progress': '#8b5cf6',
    resolved: '#10b981',
    closed: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

const getStatusEmoji = (status: string): string => {
  const emojis: Record<string, string> = {
    pending: '⏳',
    investigating: '🔍',
    'in-progress': '🔧',
    resolved: '✅',
    closed: '📁',
  };
  return emojis[status] || '📋';
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      complaintId, 
      title, 
      oldStatus, 
      newStatus, 
      resolution,
      assignedWorker 
    }: StatusNotificationRequest = await req.json();

    if (!email || !complaintId || !title || !newStatus) {
      throw new Error("Missing required fields");
    }

    const statusEmoji = getStatusEmoji(newStatus);
    const statusColor = getStatusColor(newStatus);
    const formattedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('-', ' ');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 16px 24px; border-radius: 16px;">
        <span style="font-size: 24px; font-weight: bold; color: white;">👁️ Civic-Eye</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
      <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
        ${statusEmoji} Status Update
      </h1>
      <p style="color: #94a3b8; text-align: center; margin: 0 0 24px 0;">
        Your complaint status has been updated
      </p>

      <!-- Complaint Info -->
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
          Complaint ID
        </p>
        <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
          ${complaintId}
        </p>
        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
          Title
        </p>
        <p style="color: white; font-size: 16px; margin: 0;">
          ${title}
        </p>
      </div>

      <!-- Status Change -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 24px;">
        <div style="text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">Previous</p>
          <span style="display: inline-block; padding: 8px 16px; background: #374151; color: #9ca3af; border-radius: 9999px; font-size: 14px;">
            ${oldStatus || 'N/A'}
          </span>
        </div>
        <span style="color: #64748b; font-size: 24px;">→</span>
        <div style="text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">Current</p>
          <span style="display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 9999px; font-size: 14px; font-weight: 600;">
            ${formattedStatus}
          </span>
        </div>
      </div>

      ${assignedWorker ? `
      <!-- Assigned Worker -->
      <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">👷 Assigned Worker</p>
        <p style="color: white; font-size: 16px; font-weight: 500; margin: 0;">${assignedWorker}</p>
      </div>
      ` : ''}

      ${resolution ? `
      <!-- Resolution Notes -->
      <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #22c55e;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">📝 Resolution Notes</p>
        <p style="color: white; font-size: 14px; margin: 0;">${resolution}</p>
      </div>
      ` : ''}

      ${newStatus === 'resolved' ? `
      <!-- Points Earned -->
      <div style="background: linear-gradient(135deg, #22c55e20, #16a34a20); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #22c55e40;">
        <p style="color: #22c55e; font-size: 14px; margin: 0 0 8px 0;">🎉 Congratulations!</p>
        <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">+50 Points Earned</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Thank you for helping improve our community!</p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">
        Track your complaints and rewards on your dashboard
      </p>
      <p style="color: #475569; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Civic-Eye. Making cities smarter, together.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Civic-Eye <onboarding@resend.dev>",
        to: [email],
        subject: `${statusEmoji} Your complaint "${title}" is now ${formattedStatus}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Status notification email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
