import { hashPassword } from "@szhms/auth";
import { prisma } from "../src/client";

/**
 * Seeds two demo tenants. Login with any of:
 *   admin@demo.io / doctor@demo.io / reception@demo.io / patient@demo.io
 * password: password  (see README)
 */
async function seedTenant(opts: {
  slug: string;
  name: string;
  primaryHex: string;
  accentHex: string;
}) {
  const pwd = await hashPassword("password");

  const tenant = await prisma.tenant.upsert({
    where: { slug: opts.slug },
    update: { name: opts.name, primaryHex: opts.primaryHex, accentHex: opts.accentHex },
    create: {
      slug: opts.slug,
      name: opts.name,
      logoText: opts.name.slice(0, 2).toUpperCase(),
      primaryHex: opts.primaryHex,
      accentHex: opts.accentHex,
      subscription: { create: { tier: "POLYCLINIC", status: "ACTIVE", seats: 50 } },
    },
  });

  const mkUser = (email: string, name: string, role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT") =>
    prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: { name, role, passwordHash: pwd, isActive: true },
      create: { tenantId: tenant.id, email, name, role, passwordHash: pwd },
    });

  await mkUser("admin@demo.io", "Ada Admin", "ADMIN");
  const doctorUser = await mkUser("doctor@demo.io", "Dr. Elena Reyes", "DOCTOR");
  await mkUser("reception@demo.io", "Rina Reception", "RECEPTIONIST");
  const patientUser = await mkUser("patient@demo.io", "Amara Okafor", "PATIENT");

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: doctorUser.id,
      specialty: "General Medicine",
      licenseNo: "LIC-00921",
      roomLabel: "Room 3",
    },
  });

  const patient = await prisma.patient.upsert({
    where: { tenantId_mrn: { tenantId: tenant.id, mrn: "A-1042" } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: patientUser.id,
      mrn: "A-1042",
      fullName: "Amara Okafor",
      dateOfBirth: new Date("1987-03-14"),
      sex: "FEMALE",
      allergies: ["Penicillin", "Sulfa drugs"],
      email: "patient@demo.io",
    },
  });

  const start = new Date();
  start.setHours(9, 15, 0, 0);
  const end = new Date(start.getTime() + 20 * 60_000);

  const appt = await prisma.appointment.upsert({
    where: { id: `${tenant.slug}-seed-appt-1` },
    update: {},
    create: {
      id: `${tenant.slug}-seed-appt-1`,
      tenantId: tenant.id,
      patientId: patient.id,
      doctorId: doctor.id,
      startsAt: start,
      endsAt: end,
      reason: "Hypertension review + fatigue",
      type: "Follow-up",
      status: "IN_ROOM",
    },
  });

  await prisma.medicalRecord.upsert({
    where: { appointmentId: appt.id },
    update: {},
    create: {
      tenantId: tenant.id,
      appointmentId: appt.id,
      patientId: patient.id,
      diagnoses: [{ code: "I10", label: "Essential hypertension" }],
      vitals: [
        { key: "bp", label: "Blood pressure", value: "148/94", unit: "mmHg", capturedAt: "09:12", trend: "up", status: "watch" },
        { key: "hr", label: "Heart rate", value: "82", unit: "bpm", capturedAt: "09:12", trend: "flat", status: "normal" },
        { key: "temp", label: "Temp", value: "36.8", unit: "°C", capturedAt: "09:12", status: "normal" },
        { key: "spo2", label: "SpO2", value: "97", unit: "%", capturedAt: "09:12", status: "normal" },
        { key: "rr", label: "Resp. rate", value: "16", unit: "/min", capturedAt: "09:12", status: "normal" },
        { key: "weight", label: "Weight", value: "78.4", unit: "kg", capturedAt: "09:12", trend: "up", status: "normal" },
      ],
    },
  });

  console.log(`  seeded ${opts.name} (${opts.slug})`);
}

async function main() {
  console.log("Seeding SZ HMS demo data...");
  await seedTenant({ slug: "demo", name: "SZ HMS Demo Hospital", primaryHex: "#2563EB", accentHex: "#0D9488" });
  await seedTenant({ slug: "mercy", name: "Mercy Clinic", primaryHex: "#1D4ED8", accentHex: "#0EA5E9" });
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
