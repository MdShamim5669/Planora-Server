import {
  PrismaClient,
  Role,
  Visibility,
  ParticipationStatus,
  InvitationStatus,
  PaymentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  console.log("\n🌱 [SEEDING] Starting Planora Database Seed...\n");

  // --------------------------------------------------------------------------
  // 1. Seed Admin Account
  // --------------------------------------------------------------------------
  const adminEmail = (process.env.ADMIN_EMAIL || "tamjisulislamsamim@gmail.com").toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME || "Md. Samim";
  const adminPassword = process.env.ADMIN_PASSWORD || "Samim5669";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
      notificationsEnabled: true,
    },
  });
  console.log(`  👑 Admin Account Ready: ${admin.email} (ID: ${admin.id})`);

  // --------------------------------------------------------------------------
  // 2. Seed Demo Users
  // --------------------------------------------------------------------------
  const defaultUserPassword = "User1234!";
  const userPasswordHash = await bcrypt.hash(defaultUserPassword, 10);

  const demoUsersData = [
    {
      name: "Tanvir Ahmed",
      email: "tanvir.dev@gmail.com",
      phone: "01711122233",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.designs@gmail.com",
      phone: "01822233344",
    },
    {
      name: "Rahim Uddin",
      email: "rahim.uddin@gmail.com",
      phone: "01933344455",
    },
    {
      name: "Sadia Islam",
      email: "sadia.islam@gmail.com",
      phone: "01644455566",
    },
    {
      name: "Arif Hossain",
      email: "arif.hossain@gmail.com",
      phone: "01555566677",
    },
  ];

  const users: Record<string, any> = {};

  for (const u of demoUsersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        passwordHash: userPasswordHash,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: userPasswordHash,
        role: Role.USER,
        phone: u.phone,
        notificationsEnabled: true,
      },
    });
    users[u.email] = user;
    console.log(`  👤 User Ready: ${user.name} (${user.email})`);
  }

  // --------------------------------------------------------------------------
  // 3. Clear Existing Demo Events if necessary or Upsert
  // --------------------------------------------------------------------------
  const tanvir = users["tanvir.dev@gmail.com"];
  const nusrat = users["nusrat.designs@gmail.com"];
  const rahim = users["rahim.uddin@gmail.com"];
  const sadia = users["sadia.islam@gmail.com"];
  const arif = users["arif.hossain@gmail.com"];

  // Dates
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);
  const pastDays = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  // Clear previous featured status to ensure strictly one featured event per PRD A10
  await prisma.event.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });

  const demoEventsData = [
    // 1. Featured Public Paid Event (Hero section)
    {
      title: "Tech Summit Bangladesh 2026",
      description:
        "Join the largest gathering of software engineers, architects, founders, and tech leaders in Dhaka. Featuring keynote sessions on AI, Distributed Systems, Cloud Architecture, and Web3 development. Networking lunch, swags, and certificates provided.",
      eventDate: days(15),
      venue: "Bangabandhu International Conference Center (BICC), Agargaon, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1500,
      isFeatured: true,
      organizerId: tanvir.id,
    },
    // 2. Public Free Event
    {
      title: "Dhaka React & Next.js Meetup #14",
      description:
        "A community-driven monthly meetup for React and Next.js developers. Topics include Server Components, Streaming SSR, State Management, and Tailwind CSS best practices with lightning talks and open Q&A.",
      eventDate: days(7),
      venue: "EMK Center, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      organizerId: tanvir.id,
    },
    // 3. Public Paid Event
    {
      title: "UI/UX Design Masterclass & Portfolio Review",
      description:
        "Intensive full-day workshop covering Design Systems in Figma, Component Libraries, Accessibility (WCAG 2.1), and 1-on-1 portfolio feedback sessions with industry design leads.",
      eventDate: days(10),
      venue: "Banani Club Hall, Road 11, Banani, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 800,
      isFeatured: false,
      organizerId: nusrat.id,
    },
    // 4. Public Free Event
    {
      title: "Open Source Hack Day: Building for Bangladesh",
      description:
        "Collaborate on open-source public goods, civic tech tools, and developer libraries. Mentors available for beginners and experienced contributors alike. Free snacks and stickers for all participants!",
      eventDate: days(12),
      venue: "North South University Campus, Bashundhara, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      organizerId: rahim.id,
    },
    // 5. Private Free Event
    {
      title: "Dhaka Angel Investors & Startup Founders Dinner",
      description:
        "Exclusive closed-door networking dinner connecting pre-seed and seed-stage tech founders with angel syndicates and venture capital principals. Host approval required before venue details are revealed.",
      eventDate: days(20),
      venue: "Secret Private Lounge, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 0,
      isFeatured: false,
      organizerId: rahim.id,
    },
    // 6. Private Paid Event
    {
      title: "Executive Leadership & Product Strategy Roundtable",
      description:
        "A high-impact executive cohort for VP of Engineering and Head of Product leaders. Limited to 20 seats with curated case studies, executive coaching, and gourmet dinner.",
      eventDate: days(25),
      venue: "The Westin Dhaka, Grand Ballroom Lounge",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 3500,
      isFeatured: false,
      organizerId: tanvir.id,
    },
    // 7. Public Free Online Event
    {
      title: "Intro to PostgreSQL Indexing & Performance Tuning",
      description:
        "Hands-on database workshop exploring B-tree indexes, GIN/GiST, EXPLAIN ANALYZE interpretation, query execution planning, and connection pooling strategies.",
      eventDate: days(18),
      venue: null,
      eventLink: "https://meet.google.com/xyz-planora-session",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      organizerId: tanvir.id,
    },
    // 8. Public Paid Event
    {
      title: "Full-Stack TypeScript & Prisma BootCamp",
      description:
        "Two-day weekend bootcamp building high-scale REST & GraphQL APIs using Node.js, TypeScript, Prisma ORM, and PostgreSQL. Deploying live on serverless infrastructure.",
      eventDate: days(22),
      venue: "Daffodil Tower, Dhanmondi 32, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1200,
      isFeatured: false,
      organizerId: nusrat.id,
    },
    // 9. Public Free Online Event
    {
      title: "Mobile App Development with Flutter & Dart",
      description:
        "Build cross-platform iOS and Android apps from a single codebase. Learn state management using Bloc and Riverpod, native integrations, and responsive layouts.",
      eventDate: days(28),
      venue: null,
      eventLink: "https://zoom.us/j/9876543210",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      organizerId: rahim.id,
    },
    // 10. Public Paid Event
    {
      title: "Cybersecurity & Ethical Hacking Symposium 2026",
      description:
        "Discover practical defense strategies against modern OWASP top 10 vulnerabilities, API security exploits, and zero-day threats. Live penetration testing demonstrations included.",
      eventDate: days(30),
      venue: "Radisson Blu Water Garden Hotel, Airport Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2000,
      isFeatured: false,
      organizerId: tanvir.id,
    },
    // 11. Past Public Paid Event (Crucial for reviews & rating demonstrations)
    {
      title: "DevOps & Cloud Native Dhaka 2026 (Winter Edition)",
      description:
        "A comprehensive gathering covering Kubernetes cluster management, Docker containerization, CI/CD pipelines with GitHub Actions, and GitOps workflows.",
      eventDate: pastDays(10),
      venue: "Independent University Bangladesh (IUB) Auditorium, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 500,
      isFeatured: false,
      organizerId: tanvir.id,
    },
  ];

  const events: Record<string, any> = {};

  for (const ed of demoEventsData) {
    const existing = await prisma.event.findFirst({
      where: {
        title: ed.title,
        organizerId: ed.organizerId,
      },
    });

    let ev;
    if (existing) {
      ev = await prisma.event.update({
        where: { id: existing.id },
        data: ed,
      });
    } else {
      ev = await prisma.event.create({
        data: ed,
      });
    }
    events[ed.title] = ev;
    console.log(`  🎪 Event Ready: "${ev.title}" [${ev.visibility}, Fee: ${ev.fee} BDT]`);
  }

  // --------------------------------------------------------------------------
  // 4. Seed Participations
  // --------------------------------------------------------------------------
  const pastEvent = events["DevOps & Cloud Native Dhaka 2026 (Winter Edition)"];
  const reactMeetup = events["Dhaka React & Next.js Meetup #14"];
  const designMasterclass = events["UI/UX Design Masterclass & Portfolio Review"];
  const angelDinner = events["Dhaka Angel Investors & Startup Founders Dinner"];

  const participationsData = [
    // Past Event Participants (APPROVED so they can write reviews per BR-35)
    {
      eventId: pastEvent.id,
      userId: rahim.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: pastDays(11),
    },
    {
      eventId: pastEvent.id,
      userId: sadia.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: pastDays(11),
    },
    {
      eventId: pastEvent.id,
      userId: arif.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: pastDays(11),
    },
    // React Meetup Participants (Public Free -> Instant APPROVED)
    {
      eventId: reactMeetup.id,
      userId: rahim.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: days(1),
    },
    {
      eventId: reactMeetup.id,
      userId: sadia.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: days(1),
    },
    // UI/UX Masterclass (Public Paid -> PENDING host approval)
    {
      eventId: designMasterclass.id,
      userId: sadia.id,
      status: ParticipationStatus.PENDING,
      decidedAt: null,
    },
    // Angel Dinner (Private Free -> 1 APPROVED, 1 PENDING)
    {
      eventId: angelDinner.id,
      userId: sadia.id,
      status: ParticipationStatus.APPROVED,
      decidedAt: days(2),
    },
    {
      eventId: angelDinner.id,
      userId: tanvir.id,
      status: ParticipationStatus.PENDING,
      decidedAt: null,
    },
  ];

  for (const part of participationsData) {
    await prisma.participation.upsert({
      where: {
        eventId_userId: {
          eventId: part.eventId,
          userId: part.userId,
        },
      },
      update: {
        status: part.status,
        decidedAt: part.decidedAt,
      },
      create: part,
    });
  }
  console.log(`  🎟️ Participations Seeded (${participationsData.length} records)`);

  // --------------------------------------------------------------------------
  // 5. Seed Reviews on Past Event
  // --------------------------------------------------------------------------
  const reviewsData = [
    {
      eventId: pastEvent.id,
      userId: rahim.id,
      rating: 5,
      comment:
        "Incredible sessions! The Kubernetes hands-on workshop was worth every penny. Looking forward to the next edition.",
    },
    {
      eventId: pastEvent.id,
      userId: sadia.id,
      rating: 5,
      comment:
        "Well organized, high quality speakers, and delicious food. Learned a ton about modern CI/CD pipelines.",
    },
    {
      eventId: pastEvent.id,
      userId: arif.id,
      rating: 4,
      comment:
        "Great event overall! The networking session was especially valuable for early career developers.",
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.upsert({
      where: {
        eventId_userId: {
          eventId: rev.eventId,
          userId: rev.userId,
        },
      },
      update: {
        rating: rev.rating,
        comment: rev.comment,
      },
      create: rev,
    });
  }
  console.log(`  ⭐ Reviews Seeded (${reviewsData.length} reviews on past event)`);

  // --------------------------------------------------------------------------
  // 6. Seed Invitations
  // --------------------------------------------------------------------------
  const invitationsData = [
    // Tanvir invites Sadia to Angel Dinner
    {
      eventId: angelDinner.id,
      inviteeId: arif.id,
      status: InvitationStatus.PENDING,
      respondedAt: null,
    },
    // Nusrat invites Arif to TypeScript Bootcamp
    {
      eventId: events["Full-Stack TypeScript & Prisma BootCamp"].id,
      inviteeId: arif.id,
      status: InvitationStatus.PENDING,
      respondedAt: null,
    },
  ];

  for (const inv of invitationsData) {
    await prisma.invitation.upsert({
      where: {
        eventId_inviteeId: {
          eventId: inv.eventId,
          inviteeId: inv.inviteeId,
        },
      },
      update: {
        status: inv.status,
        respondedAt: inv.respondedAt,
      },
      create: inv,
    });
  }
  console.log(`  💌 Invitations Seeded (${invitationsData.length} pending invitations)`);

  // --------------------------------------------------------------------------
  // 7. Seed Payments
  // --------------------------------------------------------------------------
  const paymentsData = [
    {
      tranId: "PLN-DEMO-PAST-01",
      userId: rahim.id,
      eventId: pastEvent.id,
      eventTitle: pastEvent.title,
      amount: pastEvent.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_DEMO_01",
      bankTranId: "BANK_DEMO_01",
      paidAt: pastDays(11),
    },
    {
      tranId: "PLN-DEMO-DESIGN-02",
      userId: sadia.id,
      eventId: designMasterclass.id,
      eventTitle: designMasterclass.title,
      amount: designMasterclass.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_DEMO_02",
      bankTranId: "BANK_DEMO_02",
      paidAt: days(1),
    },
  ];

  for (const pay of paymentsData) {
    await prisma.payment.upsert({
      where: { tranId: pay.tranId },
      update: {
        status: pay.status,
        paidAt: pay.paidAt,
      },
      create: pay,
    });
  }
  console.log(`  💳 Payments Seeded (${paymentsData.length} successful payment records)`);

  console.log("\n✨ [SEEDING COMPLETE] Planora Database successfully populated with realistic data!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
