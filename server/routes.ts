import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { generateToken, authMiddleware, type AuthRequest } from "./middleware/auth";
import { adminMiddleware } from "./middleware/admin";
import { 
  authLimiter, 
  adminLimiter, 
  logSensitiveOperation,
  validatePasswordStrength,
  validateEmail,
  containsSuspiciousPatterns
} from "./middleware/security";
import { insertUserSchema, insertPackSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe with key or empty string (validation happens at startup)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { email, password, name, phone, address } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check for suspicious patterns
      if (containsSuspiciousPatterns(email) || containsSuspiciousPatterns(name)) {
        return res.status(400).json({ message: "Invalid input detected" });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Validate input
      const validatedData = insertUserSchema.parse({
        email,
        password,
        name,
        phone,
        address,
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Log registration
      console.log(`[AUTH] User registered: ${user.email} - IP: ${req.ip}`);

      // Generate auth token for immediate login
      const token = generateToken(user.id);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "Inscription réussie !",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check for suspicious patterns
      if (containsSuspiciousPatterns(email)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken(user.id);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  // Packs routes
  app.get("/api/packs", async (req, res) => {
    try {
      const packs = await storage.getAllPacks();
      res.json(packs);
    } catch (error) {
      console.error("Error fetching packs:", error);
      res.status(500).json({ message: "Error fetching packs" });
    }
  });

  app.get("/api/packs/:id", async (req, res) => {
    try {
      const pack = await storage.getPack(req.params.id);
      if (!pack) {
        return res.status(404).json({ message: "Pack not found" });
      }
      res.json(pack);
    } catch (error) {
      console.error("Error fetching pack:", error);
      res.status(500).json({ message: "Error fetching pack" });
    }
  });

  // User profile routes
  app.get("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  app.patch("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { name, phone, address } = req.body;
      const userId = req.userId!;

      const updatedUser = await storage.updateUser(userId, {
        name,
        phone,
        address,
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Subscription routes
  app.get("/api/user/subscription", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const subscription = await storage.getSubscriptionByUserId(req.userId!);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  // Payment history routes
  app.get("/api/user/payments", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const payments = await storage.getPaymentsByUserId(req.userId!);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  // Stripe checkout session creation
  app.post("/api/create-checkout-session", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { packId, billingPeriod } = req.body;
      
      if (!packId || !billingPeriod) {
        return res.status(400).json({ message: "Pack ID and billing period are required" });
      }

      if (billingPeriod !== "monthly" && billingPeriod !== "yearly") {
        return res.status(400).json({ message: "Invalid billing period" });
      }

      const user = req.user!;
      const pack = await storage.getPack(packId);

      if (!pack) {
        return res.status(404).json({ message: "Pack not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.id, customerId, "");
      }

      // Determine price
      const priceAmount = billingPeriod === "yearly" 
        ? parseFloat(pack.priceYearly.replace(/[^0-9.]/g, ""))
        : parseFloat(pack.priceMonthly.replace(/[^0-9.]/g, ""));

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${pack.name} Pack`,
                description: pack.subtitle,
              },
              recurring: {
                interval: billingPeriod === "yearly" ? "year" : "month",
              },
              unit_amount: Math.round(priceAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.APP_URL || "http://localhost:5000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || "http://localhost:5000"}/packs?canceled=true`,
        metadata: {
          userId: user.id,
          packId: pack.id,
          billingPeriod,
        },
      });

      console.log(`[PAYMENT] Checkout session created for user ${user.email} - Pack: ${pack.name} (${billingPeriod})`);

      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Error creating checkout session" });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).send("No signature");
    }

    let event: Stripe.Event;

    try {
      // Use rawBody which is populated by the verify function in express.json()
      const rawBody = req.rawBody as Buffer;
      if (!rawBody) {
        throw new Error("Raw body not available");
      }
      
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE WEBHOOK] Event type: ${event.type}`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const { userId, packId, billingPeriod } = session.metadata || {};

          if (!userId || !packId || !billingPeriod) {
            console.error("[STRIPE] Missing metadata in checkout session");
            break;
          }

          // Idempotency check: verify this specific Stripe subscription hasn't been processed
          const stripeSubscriptionId = session.subscription as string;
          if (stripeSubscriptionId) {
            const existingUser = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (existingUser) {
              console.log(`[STRIPE] Stripe subscription ${stripeSubscriptionId} already processed, skipping duplicate`);
              break;
            }
          }

          // Calculate next billing date
          const startDate = new Date();
          const nextBillingDate = new Date(startDate);
          if (billingPeriod === "yearly") {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          } else {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }

          // Create subscription in database
          await storage.createSubscription({
            userId,
            packId,
            status: "active",
            billingPeriod,
            startDate,
            nextBillingDate,
            mileageUsed: 0,
          });

          // Update user with Stripe subscription ID
          if (session.subscription) {
            await storage.updateUserStripeInfo(
              userId,
              session.customer as string,
              session.subscription as string
            );
          }

          console.log(`[STRIPE] Subscription created for user ${userId} - Pack: ${packId}`);
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as any;
          const stripeSubscriptionId = typeof invoice.subscription === "string" 
            ? invoice.subscription 
            : invoice.subscription?.id;

          if (stripeSubscriptionId) {
            // Find subscription by Stripe subscription ID
            const user = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (user) {
              const subscription = await storage.getSubscriptionByUserId(user.id);
              if (subscription) {
                const paymentIntentId = typeof invoice.payment_intent === "string" 
                  ? invoice.payment_intent 
                  : invoice.payment_intent?.id || null;

                // Idempotency check: prevent duplicate payment records
                if (paymentIntentId) {
                  const existingPayment = await storage.getPaymentByStripePaymentIntentId(paymentIntentId);
                  if (existingPayment) {
                    console.log(`[STRIPE] Payment already recorded for intent ${paymentIntentId}, skipping duplicate`);
                    break;
                  }
                }

                // Create payment record
                const invoiceNumber = invoice.number || `INV-${Date.now()}`;
                  
                await storage.createPayment({
                  subscriptionId: subscription.id,
                  userId: user.id,
                  amount: (invoice.amount_paid / 100).toFixed(2),
                  invoiceNumber,
                  status: "succeeded",
                  stripePaymentIntentId: paymentIntentId,
                  paymentDate: new Date(),
                });

                // Update next billing date
                const nextBillingDate = new Date(subscription.nextBillingDate);
                if (subscription.billingPeriod === "yearly") {
                  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                } else {
                  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                }

                await storage.updateSubscription(subscription.id, {
                  nextBillingDate,
                  status: "active",
                });

                console.log(`[STRIPE] Payment recorded for user ${user.email}`);
              }
            }
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const stripeSubscriptionId = typeof invoice.subscription === "string" 
            ? invoice.subscription 
            : invoice.subscription?.id;

          if (stripeSubscriptionId) {
            const user = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (user) {
              const subscription = await storage.getSubscriptionByUserId(user.id);
              if (subscription) {
                await storage.updateSubscription(subscription.id, {
                  status: "inactive",
                });
                console.log(`[STRIPE] Payment failed for user ${user.email} - Subscription marked inactive`);
              }
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const user = await storage.getUserByStripeSubscriptionId(subscription.id);
          if (user) {
            const userSubscription = await storage.getSubscriptionByUserId(user.id);
            if (userSubscription) {
              await storage.updateSubscription(userSubscription.id, {
                status: "cancelled",
                endDate: new Date(),
              });
              console.log(`[STRIPE] Subscription cancelled for user ${user.email}`);
            }
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, packInterest, message } = req.body;
      
      console.log("Contact form submission:", { name, email, phone, packInterest, message });
      
      // TODO: Implement SendGrid email sending
      
      res.json({ message: "Message received. We'll get back to you soon!" });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View admin stats"), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  app.get("/api/admin/users", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all users"), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/admin/users/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update user"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { role, name, email, phone, address } = req.body;
      
      const updatedUser = await storage.updateUser(id, {
        ...(role && { role }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
      });
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.get("/api/admin/subscriptions", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all subscriptions"), async (req: AuthRequest, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      const subscriptionsWithoutPassword = subscriptions.map((sub) => ({
        ...sub,
        user: { ...sub.user, password: undefined },
      }));
      res.json(subscriptionsWithoutPassword);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });

  app.patch("/api/admin/subscriptions/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update subscription"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, vehicle, mileageUsed } = req.body;
      
      const updatedSubscription = await storage.updateSubscription(id, {
        ...(status && { status }),
        ...(vehicle && { vehicle }),
        ...(mileageUsed !== undefined && { mileageUsed }),
      });
      
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Error updating subscription" });
    }
  });

  app.get("/api/admin/packs", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all packs"), async (req: AuthRequest, res) => {
    try {
      const packs = await storage.getAllPacks();
      res.json(packs);
    } catch (error) {
      console.error("Error fetching packs:", error);
      res.status(500).json({ message: "Error fetching packs" });
    }
  });

  app.post("/api/admin/packs", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Create pack"), async (req: AuthRequest, res) => {
    try {
      const packData = insertPackSchema.parse(req.body);
      const pack = await storage.createPack(packData);
      res.status(201).json(pack);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating pack:", error);
      res.status(500).json({ message: "Error creating pack" });
    }
  });

  app.patch("/api/admin/packs/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update pack"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updatedPack = await storage.updatePack(id, req.body);
      res.json(updatedPack);
    } catch (error) {
      console.error("Error updating pack:", error);
      res.status(500).json({ message: "Error updating pack" });
    }
  });

  app.delete("/api/admin/packs/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Delete pack"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deletePack(id);
      res.json({ message: "Pack deleted successfully" });
    } catch (error) {
      console.error("Error deleting pack:", error);
      res.status(500).json({ message: "Error deleting pack" });
    }
  });

  app.get("/api/admin/payments", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View payments"), async (req: AuthRequest, res) => {
    try {
      const payments = await storage.getAllPayments();
      const paymentsWithoutPassword = payments.map((payment) => ({
        ...payment,
        user: { ...payment.user, password: undefined },
      }));
      res.json(paymentsWithoutPassword);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
