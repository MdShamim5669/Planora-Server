import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export const seedAdmin = async () => {
  const adminEmail = (env.ADMIN_EMAIL || "admin@planora.com").toLowerCase().trim();
  const adminName = env.ADMIN_NAME || "System Admin";
  const adminPassword = env.ADMIN_PASSWORD || "AdminPassword123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        notificationsEnabled: true,
      },
    });
    console.log(`Admin account seeded successfully with ID: ${admin.id}`);
    return admin;
  } else {
    console.log(`Admin account (${adminEmail}) already exists. Skipping.`);
    return existingAdmin;
  }
};
