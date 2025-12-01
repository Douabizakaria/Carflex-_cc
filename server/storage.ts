// Referenced from blueprint:javascript_database
import {
  users,
  packs,
  subscriptions,
  payments,
  type User,
  type InsertUser,
  type Pack,
  type InsertPack,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;

  // Pack operations
  getAllPacks(): Promise<Pack[]>;
  getPack(id: string): Promise<Pack | undefined>;
  createPack(pack: InsertPack): Promise<Pack>;
  updatePack(id: string, data: Partial<Pack>): Promise<Pack>;
  deletePack(id: string): Promise<void>;

  // Subscription operations
  getSubscriptionByUserId(userId: string): Promise<(Subscription & { pack: Pack }) | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  
  // Payment operations
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  getPaymentByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllSubscriptions(): Promise<Array<Subscription & { user: User; pack: Pack }>>;
  getAllPayments(): Promise<Array<Payment & { user: User }>>;
  getStats(): Promise<{
    totalUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeSubscriptionId, stripeSubscriptionId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Pack operations
  async getAllPacks(): Promise<Pack[]> {
    return await db.select().from(packs);
  }

  async getPack(id: string): Promise<Pack | undefined> {
    const [pack] = await db.select().from(packs).where(eq(packs.id, id));
    return pack || undefined;
  }

  async createPack(insertPack: InsertPack): Promise<Pack> {
    const [pack] = await db
      .insert(packs)
      .values(insertPack)
      .returning();
    return pack;
  }

  // Subscription operations
  async getSubscriptionByUserId(userId: string): Promise<(Subscription & { pack: Pack }) | undefined> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .leftJoin(packs, eq(subscriptions.packId, packs.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (result.length === 0 || !result[0].packs) {
      return undefined;
    }

    return {
      ...result[0].subscriptions,
      pack: result[0].packs,
    };
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // Payment operations
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));
  }

  async getPaymentByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePack(id: string, data: Partial<Pack>): Promise<Pack> {
    const [pack] = await db
      .update(packs)
      .set(data)
      .where(eq(packs.id, id))
      .returning();
    return pack;
  }

  async deletePack(id: string): Promise<void> {
    await db.delete(packs).where(eq(packs.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllSubscriptions(): Promise<Array<Subscription & { user: User; pack: Pack }>> {
    const result = await db
      .select()
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(packs, eq(subscriptions.packId, packs.id))
      .orderBy(desc(subscriptions.createdAt));

    return result
      .filter((row) => row.users && row.packs)
      .map((row) => ({
        ...row.subscriptions,
        user: row.users!,
        pack: row.packs!,
      }));
  }

  async getAllPayments(): Promise<Array<Payment & { user: User }>> {
    const result = await db
      .select()
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.paymentDate));

    return result
      .filter((row) => row.users)
      .map((row) => ({
        ...row.payments,
        user: row.users!,
      }));
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: string;
  }> {
    const allUsers = await db.select().from(users);
    const allSubscriptions = await db.select().from(subscriptions);
    const allPayments = await db.select().from(payments);

    const activeSubscriptions = allSubscriptions.filter((sub) => sub.status === "active");
    const totalRevenue = allPayments
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
      .toFixed(2);

    return {
      totalUsers: allUsers.length,
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
