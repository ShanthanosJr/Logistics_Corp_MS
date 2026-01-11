package Backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Admin Config
    private final String ADMIN_EMAIL = "shaan.pc1234@gmail.com";
    @SuppressWarnings("unused")
    private final String SENDER_NAME = "LogisticsCorp System";

    @Async
    public void sendLowStockAlert(String itemName, int qty) {
        try {
            System.out.println("💎 Generating Executive Alert for: " + itemName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(ADMIN_EMAIL);
            helper.setSubject("CONFIDENTIAL: Inventory Threshold Alert | " + itemName.toUpperCase());
            helper.setFrom(ADMIN_EMAIL, "Logistics Corp HQ");

            // Dynamic Data
            String refId = "NEX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm z").format(new Date());

            String htmlContent = buildExecutiveTemplate(itemName, qty, refId, timestamp);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Executive Dispatch Complete.");

        } catch (Exception e) {
            System.err.println("❌ Email Dispatch Failed: " + e.getMessage());
        }
    }

    private String buildExecutiveTemplate(String itemName, int qty, String refId, String timestamp) {
        // Calculate visual bar width (Max 100%)
        int stockPercentage = Math.min((qty * 2), 100); 
        
        // Bar Color (Red if 0, Orange if low (≤10), Green if healthy)
        String barColor = qty == 0 ? "#DC2626" : (qty <= 10 ? "#F59E0B" : "#10B981");
        
        // Status Text
        String statusText = qty == 0 ? "DEPLETED" : "CRITICAL LOW";
        
        // Status Badge Color
        String badgeColor = qty == 0 ? "#DC2626" : "#F59E0B";

        return """
            <!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta name="x-apple-disable-message-reformatting">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!--[if mso]>
                <style>
                    table {border-collapse:collapse;border-spacing:0;margin:0;}
                    div, td {padding:0;}
                </style>
                <![endif]-->
                <style type="text/css">
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%%;
                        -ms-text-size-adjust: 100%%;
                    }
                    
                    table {
                        border-collapse: collapse;
                        border-spacing: 0;
                    }
                    
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%%;
                        outline: none;
                        text-decoration: none;
                        -ms-interpolation-mode: bicubic;
                    }
                    
                    .progress-bar {
                        background-color: #E5E5E5;
                        height: 6px;
                        width: 100%%;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    
                    .progress-fill {
                        height: 100%%;
                        border-radius: 10px;
                        transition: width 0.3s ease;
                    }
                </style>
            </head>
            <body style="margin:0;padding:0;background-color:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                
                <table role="presentation" style="width:100%%;border-collapse:collapse;border:0;border-spacing:0;background-color:#F5F5F5;">
                    <tr>
                        <td align="center" style="padding:40px 0;">
                            
                            <!-- Main Container -->
                            <table role="presentation" style="width:600px;border-collapse:collapse;border:1px solid #E5E5E5;background-color:#FFFFFF;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                                
                                <!-- Header Section -->
                                <tr>
                                    <td style="padding:0;background-color:#000000;">
                                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                            <tr>
                                                <td align="center" style="padding:40px 30px;">
                                                    <!-- Logo/Symbol -->
                                                    <div style="font-size:28px;color:#FFFFFF;margin-bottom:15px;line-height:1;">◆</div>
                                                    
                                                    <!-- Company Name -->
                                                    <h1 style="margin:0;padding:0;font-size:28px;font-weight:400;color:#FFFFFF;letter-spacing:3px;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;">
                                                        LOGISTICS CORP
                                                    </h1>
                                                    
                                                    <!-- Subtitle -->
                                                    <p style="margin:8px 0 0 0;padding:0;font-size:11px;color:#999999;letter-spacing:2px;text-transform:uppercase;">
                                                        Internal Inventory Memo
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Alert Header -->
                                <tr>
                                    <td style="padding:40px 40px 30px 40px;border-bottom:2px solid #000000;">
                                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                            <tr>
                                                <td>
                                                    <!-- Action Badge -->
                                                    <span style="display:inline-block;background-color:#000000;color:#FFFFFF;padding:6px 12px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                                                        ACTION REQUIRED
                                                    </span>
                                                    
                                                    <!-- Title -->
                                                    <h2 style="margin:20px 0 8px 0;padding:0;font-size:32px;font-weight:400;color:#000000;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
                                                        Stock Level Alert
                                                    </h2>
                                                    
                                                    <!-- Description -->
                                                    <p style="margin:0;padding:0;font-size:15px;color:#666666;font-style:italic;font-family:Georgia,'Times New Roman',serif;line-height:1.5;">
                                                        The following asset has dropped below operational standards.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Asset Information Grid -->
                                <tr>
                                    <td style="padding:0;">
                                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                            <tr>
                                                <!-- Left Column: Asset Name -->
                                                <td style="width:50%%;padding:30px 40px;border-right:1px solid #E5E5E5;border-bottom:1px solid #E5E5E5;vertical-align:top;">
                                                    <p style="margin:0 0 8px 0;padding:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-weight:600;">
                                                        ASSET DESIGNATION
                                                    </p>
                                                    <p style="margin:0;padding:0;font-size:18px;font-weight:700;color:#000000;line-height:1.3;">
                                                        %s
                                                    </p>
                                                    <p style="margin:8px 0 0 0;padding:0;font-size:11px;color:#999999;font-family:monospace;">
                                                        ID: %s
                                                    </p>
                                                </td>
                                                
                                                <!-- Right Column: Status -->
                                                <td style="width:50%%;padding:30px 40px;border-bottom:1px solid #E5E5E5;vertical-align:top;">
                                                    <p style="margin:0 0 8px 0;padding:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-weight:600;">
                                                        CURRENT STATUS
                                                    </p>
                                                    <span style="display:inline-block;background-color:%s;color:#FFFFFF;padding:6px 12px;font-size:12px;font-weight:700;letter-spacing:1px;border-radius:4px;">
                                                        %s
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Inventory Metrics -->
                                <tr>
                                    <td style="padding:40px 40px 30px 40px;border-bottom:1px solid #E5E5E5;">
                                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                            <tr>
                                                <td>
                                                    <!-- Metrics Header -->
                                                    <table role="presentation" style="width:100%%;border-collapse:collapse;margin-bottom:15px;">
                                                        <tr>
                                                            <td style="vertical-align:bottom;">
                                                                <p style="margin:0 0 5px 0;padding:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-weight:600;">
                                                                    REMAINING UNITS
                                                                </p>
                                                                <p style="margin:0;padding:0;font-size:56px;font-weight:800;color:#000000;line-height:1;font-family:Georgia,'Times New Roman',serif;">
                                                                    %d
                                                                </p>
                                                            </td>
                                                            <td align="right" style="vertical-align:bottom;">
                                                                <p style="margin:0;padding:0;font-size:14px;font-weight:700;color:#000000;">
                                                                    %d%%%% Capacity
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                    <!-- Progress Bar -->
                                                    <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                                        <tr>
                                                            <td>
                                                                <div style="background-color:#E5E5E5;height:6px;width:100%%;border-radius:10px;overflow:hidden;">
                                                                    <div style="background-color:%s;height:100%%;width:%d%%;border-radius:10px;"></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                    <!-- Threshold Info -->
                                                    <p style="margin:10px 0 0 0;padding:0;font-size:11px;color:#999999;text-align:right;">
                                                        Critical Threshold: 10 Units
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- CTA Button -->
                                <tr>
                                    <td align="center" style="padding:40px;">
                                        <table role="presentation" style="border-collapse:collapse;">
                                            <tr>
                                                <td align="center">
                                                    <a href="http://localhost:3000/display-item" style="display:inline-block;background-color:#000000;color:#FFFFFF;text-decoration:none;padding:16px 40px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border:2px solid #000000;border-radius:0;">
                                                        ACCESS INVENTORY DASHBOARD →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding:30px 40px;background-color:#FAFAFA;border-top:1px solid #E5E5E5;">
                                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                                            <tr>
                                                <td style="vertical-align:top;">
                                                    <p style="margin:0;padding:0;font-size:13px;font-weight:700;color:#000000;">
                                                        LOGISTICS CORP
                                                    </p>
                                                    <p style="margin:5px 0 0 0;padding:0;font-size:11px;color:#999999;">
                                                        Internal System Dispatch
                                                    </p>
                                                </td>
                                                <td align="right" style="vertical-align:top;">
                                                    <p style="margin:0;padding:0;font-size:10px;color:#CCCCCC;font-family:monospace;">
                                                        %s
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding-top:20px;">
                                                    <p style="margin:0;padding:0;font-size:10px;color:#999999;line-height:1.6;">
                                                        This is an automated alert from the Logistics Corp inventory monitoring system. 
                                                        Please do not reply to this email. For support, contact your system administrator.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                            </table>
                            
                        </td>
                    </tr>
                </table>
                
            </body>
            </html>
            """.formatted(
                itemName,           // Asset name
                refId,              // Reference ID
                badgeColor,         // Status badge background color
                statusText,         // Status text (CRITICAL LOW / DEPLETED)
                qty,                // Quantity number
                stockPercentage,    // Percentage text
                barColor,           // Progress bar color
                stockPercentage,    // Progress bar width percentage
                timestamp           // Timestamp
            );
    }
}