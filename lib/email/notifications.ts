import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
    try {
        const data = await resend.emails.send({
            from: 'Valentine Exchange <noreply@yourdomain.com>',
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

// Draw Day Notification Email
export async function sendDrawDayEmail(userEmail: string, userName: string) {
    const subject = "🎉 It's Draw Day! Your Valentine Awaits";

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Draw Day - Valentine Exchange</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E31B23 0%, #FF85A2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800;">
                      💘 It's Draw Day!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #111827; font-size: 18px; line-height: 1.6;">
                      Hi <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      The moment you've been waiting for is here! 🎊
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your Secret Valentine has been assigned and is ready to be revealed. Click the button below to discover who you'll be gifting to this Valentine's Day!
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/live-picker" 
                             style="display: inline-block; background-color: #E31B23; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(227, 27, 35, 0.3);">
                            Draw My Valentine 💘
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #FEF2F2; border-left: 4px solid #E31B23; padding: 16px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.5;">
                        <strong>🔒 Remember:</strong> Your match is confidential. Keep it a secret until you're ready to reveal yourself!
                      </p>
                    </div>
                    
                    <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                      Can't wait to see the magic unfold! ✨
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px; color: #6B7280; font-size: 12px;">
                      Valentine Exchange 2026
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                      You're receiving this because you joined the Secret Valentine Exchange
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    return sendEmail({ to: userEmail, subject, html });
}

// New Message Notification Email
export async function sendNewMessageEmail(userEmail: string, userName: string) {
    const subject = "💬 New message from your Secret Valentine";

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message - Valentine Exchange</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E31B23 0%, #FF85A2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                      💬 You've Got Mail!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #111827; font-size: 18px; line-height: 1.6;">
                      Hi <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your Secret Valentine just sent you a message! 💌
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Head over to the chat to see what they said. Who knows, it might be the start of something special!
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" 
                             style="display: inline-block; background-color: #E31B23; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(227, 27, 35, 0.3);">
                            View Message
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
                      Happy chatting! 💕
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px; color: #6B7280; font-size: 12px;">
                      Valentine Exchange 2026
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                      You're receiving this because you're part of the Secret Valentine Exchange
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    return sendEmail({ to: userEmail, subject, html });
}

// Friend Joined Notification Email
export async function sendFriendJoinedEmail(
    userEmail: string,
    userName: string,
    friendName: string
) {
    const subject = `🎉 ${friendName} joined the Valentine Exchange!`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Friend Joined - Valentine Exchange</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E31B23 0%, #FF85A2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                      🎊 Your Friend Joined!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #111827; font-size: 18px; line-height: 1.6;">
                      Hi <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Great news! <strong>${friendName}</strong> just joined the Valentine Exchange using your invite code! 🎉
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      The Love Pool is growing, and the excitement is building. Keep spreading the love and invite more friends!
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/home" 
                             style="display: inline-block; background-color: #E31B23; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(227, 27, 35, 0.3);">
                            View Love Pool
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
                      Thanks for spreading the love! 💖
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px; color: #6B7280; font-size: 12px;">
                      Valentine Exchange 2026
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                      You're receiving this because you invited friends to the exchange
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    return sendEmail({ to: userEmail, subject, html });
}

// Welcome Email (sent after registration)
export async function sendWelcomeEmail(userEmail: string, userName: string) {
    const subject = "💘 Welcome to the Valentine Exchange!";

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - Valentine Exchange</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E31B23 0%, #FF85A2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800;">
                      💘 Welcome Aboard!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #111827; font-size: 18px; line-height: 1.6;">
                      Hi <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Welcome to the Secret Valentine Exchange! We're thrilled to have you join the Love Pool. 🎊
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Here's what happens next:
                    </p>
                    
                    <div style="background-color: #FEF2F2; border-radius: 12px; padding: 24px; margin: 0 0 30px;">
                      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                        <li style="margin-bottom: 12px;"><strong>Complete your profile</strong> - Add your bio, interests, and wishlist</li>
                        <li style="margin-bottom: 12px;"><strong>Wait for Draw Day</strong> - We'll notify you when it's time</li>
                        <li style="margin-bottom: 12px;"><strong>Reveal your match</strong> - Discover who you're gifting to</li>
                        <li><strong>Get to know them</strong> - Chat anonymously and plan the perfect gift</li>
                      </ol>
                    </div>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile-setup" 
                             style="display: inline-block; background-color: #E31B23; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(227, 27, 35, 0.3);">
                            Complete Your Profile
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
                      Let the magic begin! ✨
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px; color: #6B7280; font-size: 12px;">
                      Valentine Exchange 2026
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                      You're receiving this because you just joined the Secret Valentine Exchange
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    return sendEmail({ to: userEmail, subject, html });
}
