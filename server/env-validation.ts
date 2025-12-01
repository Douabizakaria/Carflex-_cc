/**
 * Environment Variable Validation
 * Validates that all required environment variables are set before starting the server
 */

export function validateEnvironment() {
  // Check both REPLIT_DEPLOYMENT (set to "1" in deployments) and NODE_ENV (set to "production")
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === "production";
  
  const requiredVars = [
    "DATABASE_URL",
    "SESSION_SECRET",
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Stripe keys are required but we provide helpful fallback messages
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  WARNING: STRIPE_SECRET_KEY is not set. Payment functionality will not work.");
    if (isProduction) {
      missingVars.push("STRIPE_SECRET_KEY (required in production)");
    }
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET && isProduction) {
    console.warn("⚠️  WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.");
  }

  if (missingVars.length > 0) {
    console.error("❌ FATAL: Missing required environment variables:");
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    if (isProduction) {
      console.error("\n📋 Required variables for production:");
      console.error("   - DATABASE_URL: PostgreSQL connection string");
      console.error("   - SESSION_SECRET: JWT signing secret (32+ characters)");
      console.error("   - STRIPE_SECRET_KEY: Stripe secret key (sk_live_...)");
      console.error("   - STRIPE_WEBHOOK_SECRET: Stripe webhook secret (whsec_...)");
      console.error("\n💡 Configure these in Replit Secrets or deployment environment");
      process.exit(1);
    } else {
      console.error("\n💡 In development, some variables may use defaults");
    }
  }

  // Log environment info
  console.log(`✓ Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`✓ Port: ${process.env.PORT || '5000'}`);
  console.log(`✓ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`✓ Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
}
