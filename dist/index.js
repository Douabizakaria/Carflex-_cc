var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertPackSchema: () => insertPackSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  packs: () => packs,
  packsRelations: () => packsRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var packs = pgTable("packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  subtitle: text("subtitle").notNull(),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }).notNull(),
  mileageLimit: integer("mileage_limit"),
  features: text("features").array().notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  packId: varchar("pack_id").notNull().references(() => packs.id),
  status: text("status").notNull().default("active"),
  billingPeriod: text("billing_period").notNull(),
  vehicle: text("vehicle"),
  mileageUsed: integer("mileage_used").notNull().default(0),
  startDate: timestamp("start_date").notNull().defaultNow(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  invoiceNumber: text("invoice_number").notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  payments: many(payments)
}));
var packsRelations = relations(packs, ({ many }) => ({
  subscriptions: many(subscriptions)
}));
var subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  pack: one(packs, {
    fields: [subscriptions.packId],
    references: [packs.id]
  }),
  payments: many(payments)
}));
var paymentsRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id]
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true
});
var insertPackSchema = createInsertSchema(packs).omit({
  id: true,
  createdAt: true
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByStripeSubscriptionId(stripeSubscriptionId) {
    const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, stripeSubscriptionId));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, data) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserStripeInfo(id, stripeCustomerId, stripeSubscriptionId) {
    const [user] = await db.update(users).set({ stripeCustomerId, stripeSubscriptionId }).where(eq(users.id, id)).returning();
    return user;
  }
  // Pack operations
  async getAllPacks() {
    return await db.select().from(packs);
  }
  async getPack(id) {
    const [pack] = await db.select().from(packs).where(eq(packs.id, id));
    return pack || void 0;
  }
  async createPack(insertPack) {
    const [pack] = await db.insert(packs).values(insertPack).returning();
    return pack;
  }
  // Subscription operations
  async getSubscriptionByUserId(userId) {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).leftJoin(packs, eq(subscriptions.packId, packs.id)).orderBy(desc(subscriptions.createdAt)).limit(1);
    if (result.length === 0 || !result[0].packs) {
      return void 0;
    }
    return {
      ...result[0].subscriptions,
      pack: result[0].packs
    };
  }
  async createSubscription(insertSubscription) {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }
  async updateSubscription(id, data) {
    const [subscription] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return subscription;
  }
  // Payment operations
  async getPaymentsByUserId(userId) {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.paymentDate));
  }
  async getPaymentByStripePaymentIntentId(stripePaymentIntentId) {
    const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment || void 0;
  }
  async createPayment(insertPayment) {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  async updatePack(id, data) {
    const [pack] = await db.update(packs).set(data).where(eq(packs.id, id)).returning();
    return pack;
  }
  async deletePack(id) {
    await db.delete(packs).where(eq(packs.id, id));
  }
  // Admin operations
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async getAllSubscriptions() {
    const result = await db.select().from(subscriptions).leftJoin(users, eq(subscriptions.userId, users.id)).leftJoin(packs, eq(subscriptions.packId, packs.id)).orderBy(desc(subscriptions.createdAt));
    return result.filter((row) => row.users && row.packs).map((row) => ({
      ...row.subscriptions,
      user: row.users,
      pack: row.packs
    }));
  }
  async getAllPayments() {
    const result = await db.select().from(payments).leftJoin(users, eq(payments.userId, users.id)).orderBy(desc(payments.paymentDate));
    return result.filter((row) => row.users).map((row) => ({
      ...row.payments,
      user: row.users
    }));
  }
  async getStats() {
    const allUsers = await db.select().from(users);
    const allSubscriptions = await db.select().from(subscriptions);
    const allPayments = await db.select().from(payments);
    const activeSubscriptions = allSubscriptions.filter((sub) => sub.status === "active");
    const totalRevenue = allPayments.reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2);
    return {
      totalUsers: allUsers.length,
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalRevenue
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import bcrypt from "bcryptjs";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "carflex-secret-key-change-in-production";
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  const user = await storage.getUser(decoded.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = user;
  req.userId = user.id;
  next();
}

// server/middleware/admin.ts
function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// server/middleware/security.ts
import rateLimit from "express-rate-limit";
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 requests per windowMs
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
var adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 50,
  // Limit admin operations
  message: { message: "Too many admin requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
function sanitizeInput(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
        if (req.body[key].length > 1e4) {
          return res.status(400).json({
            message: `Field ${key} exceeds maximum length`
          });
        }
      }
    }
  }
  next();
}
function logSensitiveOperation(operation) {
  return (req, res, next) => {
    const user = req.user;
    console.log(`[SECURITY] ${operation} - User: ${user?.email || "Unknown"} - IP: ${req.ip}`);
    next();
  };
}
function validateRequestSize(req, res, next) {
  const contentLength = req.get("content-length");
  const maxSize = 10 * 1024 * 1024;
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      message: "Request payload too large"
    });
  }
  next();
}
function preventParamPollution(req, res, next) {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }
  next();
}
function securityHeaders(req, res, next) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
}
function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
function containsSuspiciousPatterns(input) {
  const suspiciousPatterns = [
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(--|\/\*|\*\/|;)/
  ];
  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

// server/routes.ts
import { z } from "zod";
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-09-30.clover",
  typescript: true
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { email, password, name, phone, address } = req.body;
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (containsSuspiciousPatterns(email) || containsSuspiciousPatterns(name)) {
        return res.status(400).json({ message: "Invalid input detected" });
      }
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      const validatedData = insertUserSchema.parse({
        email,
        password,
        name,
        phone,
        address
      });
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      console.log(`[AUTH] User registered: ${user.email} - IP: ${req.ip}`);
      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "Inscription r\xE9ussie !"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });
  app2.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (!validateEmail(email)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (containsSuspiciousPatterns(email)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });
  app2.get("/api/auth/me", authMiddleware, async (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });
  app2.get("/api/packs", async (req, res) => {
    try {
      const packs2 = await storage.getAllPacks();
      res.json(packs2);
    } catch (error) {
      console.error("Error fetching packs:", error);
      res.status(500).json({ message: "Error fetching packs" });
    }
  });
  app2.get("/api/packs/:id", async (req, res) => {
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
  app2.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  });
  app2.patch("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      const userId = req.userId;
      const updatedUser = await storage.updateUser(userId, {
        name,
        phone,
        address
      });
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  app2.get("/api/user/subscription", authMiddleware, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionByUserId(req.userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });
  app2.get("/api/user/payments", authMiddleware, async (req, res) => {
    try {
      const payments2 = await storage.getPaymentsByUserId(req.userId);
      res.json(payments2);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Error fetching payments" });
    }
  });
  app2.post("/api/create-checkout-session", authMiddleware, async (req, res) => {
    try {
      const { packId, billingPeriod } = req.body;
      if (!packId || !billingPeriod) {
        return res.status(400).json({ message: "Pack ID and billing period are required" });
      }
      if (billingPeriod !== "monthly" && billingPeriod !== "yearly") {
        return res.status(400).json({ message: "Invalid billing period" });
      }
      const user = req.user;
      const pack = await storage.getPack(packId);
      if (!pack) {
        return res.status(404).json({ message: "Pack not found" });
      }
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.id, customerId, "");
      }
      const priceAmount = billingPeriod === "yearly" ? parseFloat(pack.priceYearly.replace(/[^0-9.]/g, "")) : parseFloat(pack.priceMonthly.replace(/[^0-9.]/g, ""));
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
                description: pack.subtitle
              },
              recurring: {
                interval: billingPeriod === "yearly" ? "year" : "month"
              },
              unit_amount: Math.round(priceAmount * 100)
            },
            quantity: 1
          }
        ],
        success_url: `${process.env.APP_URL || "http://localhost:5000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || "http://localhost:5000"}/packs?canceled=true`,
        metadata: {
          userId: user.id,
          packId: pack.id,
          billingPeriod
        }
      });
      console.log(`[PAYMENT] Checkout session created for user ${user.email} - Pack: ${pack.name} (${billingPeriod})`);
      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Error creating checkout session" });
    }
  });
  app2.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("No signature");
    }
    let event;
    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new Error("Raw body not available");
      }
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log(`[STRIPE WEBHOOK] Event type: ${event.type}`);
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const { userId, packId, billingPeriod } = session.metadata || {};
          if (!userId || !packId || !billingPeriod) {
            console.error("[STRIPE] Missing metadata in checkout session");
            break;
          }
          const stripeSubscriptionId = session.subscription;
          if (stripeSubscriptionId) {
            const existingUser = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (existingUser) {
              console.log(`[STRIPE] Stripe subscription ${stripeSubscriptionId} already processed, skipping duplicate`);
              break;
            }
          }
          const startDate = /* @__PURE__ */ new Date();
          const nextBillingDate = new Date(startDate);
          if (billingPeriod === "yearly") {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          } else {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }
          await storage.createSubscription({
            userId,
            packId,
            status: "active",
            billingPeriod,
            startDate,
            nextBillingDate,
            mileageUsed: 0
          });
          if (session.subscription) {
            await storage.updateUserStripeInfo(
              userId,
              session.customer,
              session.subscription
            );
          }
          console.log(`[STRIPE] Subscription created for user ${userId} - Pack: ${packId}`);
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const stripeSubscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
          if (stripeSubscriptionId) {
            const user = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (user) {
              const subscription = await storage.getSubscriptionByUserId(user.id);
              if (subscription) {
                const paymentIntentId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id || null;
                if (paymentIntentId) {
                  const existingPayment = await storage.getPaymentByStripePaymentIntentId(paymentIntentId);
                  if (existingPayment) {
                    console.log(`[STRIPE] Payment already recorded for intent ${paymentIntentId}, skipping duplicate`);
                    break;
                  }
                }
                const invoiceNumber = invoice.number || `INV-${Date.now()}`;
                await storage.createPayment({
                  subscriptionId: subscription.id,
                  userId: user.id,
                  amount: (invoice.amount_paid / 100).toFixed(2),
                  invoiceNumber,
                  status: "succeeded",
                  stripePaymentIntentId: paymentIntentId,
                  paymentDate: /* @__PURE__ */ new Date()
                });
                const nextBillingDate = new Date(subscription.nextBillingDate);
                if (subscription.billingPeriod === "yearly") {
                  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                } else {
                  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                }
                await storage.updateSubscription(subscription.id, {
                  nextBillingDate,
                  status: "active"
                });
                console.log(`[STRIPE] Payment recorded for user ${user.email}`);
              }
            }
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const stripeSubscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
          if (stripeSubscriptionId) {
            const user = await storage.getUserByStripeSubscriptionId(stripeSubscriptionId);
            if (user) {
              const subscription = await storage.getSubscriptionByUserId(user.id);
              if (subscription) {
                await storage.updateSubscription(subscription.id, {
                  status: "inactive"
                });
                console.log(`[STRIPE] Payment failed for user ${user.email} - Subscription marked inactive`);
              }
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const user = await storage.getUserByStripeSubscriptionId(subscription.id);
          if (user) {
            const userSubscription = await storage.getSubscriptionByUserId(user.id);
            if (userSubscription) {
              await storage.updateSubscription(userSubscription.id, {
                status: "cancelled",
                endDate: /* @__PURE__ */ new Date()
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, packInterest, message } = req.body;
      console.log("Contact form submission:", { name, email, phone, packInterest, message });
      res.json({ message: "Message received. We'll get back to you soon!" });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });
  app2.get("/api/admin/stats", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View admin stats"), async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.get("/api/admin/users", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all users"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPassword = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.patch("/api/admin/users/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update user"), async (req, res) => {
    try {
      const { id } = req.params;
      const { role, name, email, phone, address } = req.body;
      const updatedUser = await storage.updateUser(id, {
        ...role && { role },
        ...name && { name },
        ...email && { email },
        ...phone && { phone },
        ...address && { address }
      });
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/admin/subscriptions", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all subscriptions"), async (req, res) => {
    try {
      const subscriptions2 = await storage.getAllSubscriptions();
      const subscriptionsWithoutPassword = subscriptions2.map((sub) => ({
        ...sub,
        user: { ...sub.user, password: void 0 }
      }));
      res.json(subscriptionsWithoutPassword);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });
  app2.patch("/api/admin/subscriptions/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update subscription"), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, vehicle, mileageUsed } = req.body;
      const updatedSubscription = await storage.updateSubscription(id, {
        ...status && { status },
        ...vehicle && { vehicle },
        ...mileageUsed !== void 0 && { mileageUsed }
      });
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Error updating subscription" });
    }
  });
  app2.get("/api/admin/packs", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View all packs"), async (req, res) => {
    try {
      const packs2 = await storage.getAllPacks();
      res.json(packs2);
    } catch (error) {
      console.error("Error fetching packs:", error);
      res.status(500).json({ message: "Error fetching packs" });
    }
  });
  app2.post("/api/admin/packs", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Create pack"), async (req, res) => {
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
  app2.patch("/api/admin/packs/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Update pack"), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPack = await storage.updatePack(id, req.body);
      res.json(updatedPack);
    } catch (error) {
      console.error("Error updating pack:", error);
      res.status(500).json({ message: "Error updating pack" });
    }
  });
  app2.delete("/api/admin/packs/:id", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("Delete pack"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePack(id);
      res.json({ message: "Pack deleted successfully" });
    } catch (error) {
      console.error("Error deleting pack:", error);
      res.status(500).json({ message: "Error deleting pack" });
    }
  });
  app2.get("/api/admin/payments", adminLimiter, authMiddleware, adminMiddleware, logSensitiveOperation("View payments"), async (req, res) => {
    try {
      const payments2 = await storage.getAllPayments();
      const paymentsWithoutPassword = payments2.map((payment) => ({
        ...payment,
        user: { ...payment.user, password: void 0 }
      }));
      res.json(paymentsWithoutPassword);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Error fetching payments" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/env-validation.ts
function validateEnvironment() {
  const isProduction2 = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === "production";
  const requiredVars = [
    "DATABASE_URL",
    "SESSION_SECRET"
  ];
  const missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("\u26A0\uFE0F  WARNING: STRIPE_SECRET_KEY is not set. Payment functionality will not work.");
    if (isProduction2) {
      missingVars.push("STRIPE_SECRET_KEY (required in production)");
    }
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET && isProduction2) {
    console.warn("\u26A0\uFE0F  WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.");
  }
  if (missingVars.length > 0) {
    console.error("\u274C FATAL: Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    if (isProduction2) {
      console.error("\n\u{1F4CB} Required variables for production:");
      console.error("   - DATABASE_URL: PostgreSQL connection string");
      console.error("   - SESSION_SECRET: JWT signing secret (32+ characters)");
      console.error("   - STRIPE_SECRET_KEY: Stripe secret key (sk_live_...)");
      console.error("   - STRIPE_WEBHOOK_SECRET: Stripe webhook secret (whsec_...)");
      console.error("\n\u{1F4A1} Configure these in Replit Secrets or deployment environment");
      process.exit(1);
    } else {
      console.error("\n\u{1F4A1} In development, some variables may use defaults");
    }
  }
  console.log(`\u2713 Environment: ${isProduction2 ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(`\u2713 Port: ${process.env.PORT || "5000"}`);
  console.log(`\u2713 Database: ${process.env.DATABASE_URL ? "Connected" : "Not configured"}`);
  console.log(`\u2713 Stripe: ${process.env.STRIPE_SECRET_KEY ? "Configured" : "Not configured"}`);
}

// server/index.ts
import helmet from "helmet";
import cors from "cors";
var app = express2();
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // Required for Vite in dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Required for Vite
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  // Required for some assets
  hsts: {
    maxAge: 31536e3,
    includeSubDomains: true,
    preload: true
  }
}));
var isProduction = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === "production";
var corsOptions = {
  origin: isProduction ? true : ["http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(validateRequestSize);
app.use(generalLimiter);
app.use(preventParamPollution);
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
  limit: "10mb"
  // Limit JSON payload size
}));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use(sanitizeInput);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  validateEnvironment();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isProduction2 = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === "production";
  if (isProduction2) {
    log("Running in production mode - serving static files");
    serveStatic(app);
  } else {
    log("Running in development mode - setting up Vite");
    await setupVite(app, server);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
