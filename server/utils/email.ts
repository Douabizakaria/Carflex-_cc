import crypto from "crypto";
import { Resend } from "resend";

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Génère un token de vérification d'email aléatoire et sécurisé
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Crée une URL de vérification d'email
 */
export function createVerificationUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Calcule la date d'expiration du token (24 heures par défaut)
 */
export function getTokenExpiration(hours: number = 24): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}

/**
 * Prépare le contenu de l'email de vérification
 */
export function createVerificationEmailContent(name: string, verificationUrl: string) {
  return {
    subject: "Confirmez votre inscription à Carflex",
    text: `
Bonjour ${name},

Bienvenue sur Carflex !

Nous sommes ravis de vous compter parmi nous. Pour finaliser votre inscription et accéder à nos services d'abonnement automobile flexible, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

${verificationUrl}

Ce lien de vérification est valable pendant 24 heures.

Une fois votre email confirmé, vous pourrez :
• Explorer nos forfaits d'abonnement automobile
• Souscrire à un abonnement mensuel ou annuel
• Gérer votre véhicule et votre profil

Si vous n'avez pas créé de compte Carflex, vous pouvez ignorer cet email en toute sécurité.

À très bientôt sur la route,
L'équipe Carflex
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre inscription - Carflex</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f4f4f5;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }
    .content {
      padding: 40px 30px;
    }
    h2 {
      color: #0f172a;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    p {
      color: #475569;
      margin-bottom: 16px;
      font-size: 15px;
    }
    .greeting {
      color: #0f172a;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
    .features {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .features-title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .features ul {
      list-style: none;
      padding: 0;
    }
    .features li {
      color: #475569;
      padding: 6px 0;
      font-size: 14px;
      padding-left: 24px;
      position: relative;
    }
    .features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: bold;
    }
    .alt-link {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .alt-link p {
      margin-bottom: 8px;
      font-size: 13px;
      color: #64748b;
    }
    .link-url {
      word-break: break-all;
      color: #3b82f6;
      font-size: 12px;
      font-family: monospace;
    }
    .expiry-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .expiry-notice p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
      font-weight: 500;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    .footer p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .copyright {
      color: #94a3b8;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">CARFLEX</div>
      <div class="tagline">Abonnement automobile flexible</div>
    </div>
    
    <div class="content">
      <h2>Confirmez votre adresse email</h2>
      
      <p class="greeting">Bonjour ${name},</p>
      
      <p>Nous sommes ravis de vous compter parmi nous ! Pour finaliser votre inscription et accéder à nos services d'abonnement automobile flexible, veuillez confirmer votre adresse email.</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="button">Confirmer mon email</a>
      </div>
      
      <div class="features">
        <div class="features-title">Une fois votre email confirmé, vous pourrez :</div>
        <ul>
          <li>Explorer nos forfaits d'abonnement automobile</li>
          <li>Souscrire à un abonnement mensuel ou annuel</li>
          <li>Gérer votre véhicule et votre profil</li>
          <li>Accéder à l'assistance client dédiée</li>
        </ul>
      </div>
      
      <div class="expiry-notice">
        <p>⏱ Ce lien de vérification est valable pendant 24 heures</p>
      </div>
      
      <div class="alt-link">
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <div class="link-url">${verificationUrl}</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Si vous n'avez pas créé de compte Carflex, vous pouvez ignorer cet email en toute sécurité.</p>
      <p class="copyright">© ${new Date().getFullYear()} Carflex - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

/**
 * Envoie un email de vérification via Resend
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
): Promise<void> {
  const emailContent = createVerificationEmailContent(name, verificationUrl);

  // En développement sans clé API, on log l'email
  if (!process.env.RESEND_API_KEY) {
    console.log("\n=== EMAIL DE VÉRIFICATION (Mode Développement) ===");
    console.log(`À: ${to}`);
    console.log(`Sujet: ${emailContent.subject}`);
    console.log(`\n${emailContent.text}\n`);
    console.log("==============================\n");
    return;
  }

  // Envoyer l'email via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: "Carflex <onboarding@resend.dev>", // Utiliser votre domaine vérifié en production
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error);
      
      // En développement, si c'est une erreur de domaine non vérifié, on la logge mais on ne bloque pas
      if (error.name === "validation_error" && error.message?.includes("verify a domain")) {
        console.warn("\n⚠️  RESEND - MODE TEST");
        console.warn("Vous utilisez une clé API Resend de test.");
        console.warn("En mode test, vous ne pouvez envoyer des emails qu'à votre propre adresse.");
        console.warn(`Pour envoyer à d'autres adresses, vérifiez un domaine sur https://resend.com/domains\n`);
      }
      
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }

    console.log(`✅ Email de vérification envoyé à ${to} (ID: ${data?.id})`);
  } catch (error) {
    console.error("Erreur Resend:", error);
    throw error;
  }
}
