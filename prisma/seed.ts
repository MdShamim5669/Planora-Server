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
  console.log("\n🌱 [SEEDING] Starting Planora 50-Event Master Database Seed...\n");

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
  // 2. Seed 9 Dedicated Organizers / Hosts & Demo Users
  // --------------------------------------------------------------------------
  const defaultUserPassword = "User1234!";
  const userPasswordHash = await bcrypt.hash(defaultUserPassword, 10);

  const demoUsersData = [
    {
      name: "Tanvir Ahmed",
      email: "tanvir.dev@gmail.com",
      phone: "+8801711122233",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.designs@gmail.com",
      phone: "+8801822233344",
    },
    {
      name: "Rahim Uddin",
      email: "rahim.uddin@gmail.com",
      phone: "+8801933344455",
    },
    {
      name: "Sadia Islam",
      email: "sadia.islam@gmail.com",
      phone: "+8801644455566",
    },
    {
      name: "Arif Hossain",
      email: "arif.hossain@gmail.com",
      phone: "+8801555566677",
    },
    {
      name: "Farhan Karim",
      email: "farhan.karim@gmail.com",
      phone: "+8801788899900",
    },
    {
      name: "Tasnim Rahman",
      email: "tasnim.rahman@gmail.com",
      phone: "+8801899900011",
    },
    {
      name: "Mahin Chowdhury",
      email: "mahin.c@gmail.com",
      phone: "+8801611144477",
    },
    {
      name: "Ayesha Siddiqa",
      email: "ayesha.s@gmail.com",
      phone: "+8801922255588",
    },
  ];

  const users: Record<string, any> = {
    [admin.email]: admin,
  };

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
    console.log(`  👤 Host/User Ready: ${user.name} (${user.email})`);
  }

  // Convenient Host References
  const samim = admin;
  const tanvir = users["tanvir.dev@gmail.com"];
  const nusrat = users["nusrat.designs@gmail.com"];
  const rahim = users["rahim.uddin@gmail.com"];
  const sadia = users["sadia.islam@gmail.com"];
  const arif = users["arif.hossain@gmail.com"];
  const farhan = users["farhan.karim@gmail.com"];
  const tasnim = users["tasnim.rahman@gmail.com"];
  const mahin = users["mahin.c@gmail.com"];
  const ayesha = users["ayesha.s@gmail.com"];

  // Date helper functions relative to current execution time
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);
  const pastDays = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  // Clear previous featured status to maintain strictly one featured event per PRD BL-08
  await prisma.event.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });

  // --------------------------------------------------------------------------
  // 3. Define 50 Highly Curated, Realistic Events
  // --------------------------------------------------------------------------
  const allEventsData = [
    // ------------------- FLAGSHIP HERO FEATURED EVENT -------------------
    {
      title: "Tech Summit Bangladesh 2026",
      description:
        "The premier national technology conference bringing together 1,500+ software engineers, engineering leaders, and founders. Keynotes on generative AI agents, hyperscale distributed cloud architecture, and modern TypeScript systems. Includes catered lunch, tech swags, networking lounge, and accredited certificates.",
      eventDate: days(14),
      venue: "Bangabandhu International Conference Center (BICC), Agargaon, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1500,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },

    // ------------------- PUBLIC FREE EVENTS (20 EVENTS) -------------------
    {
      title: "Dhaka React & Next.js Meetup #14",
      description:
        "Monthly community gathering for React ecosystem enthusiasts. Deep dive into React 19 Actions, Server Components, Streaming SSR, and Turbopack internals. Lightning talks, open floor Q&A, and pizza networking!",
      eventDate: days(5),
      venue: "EMK Center, 8th Floor, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Open Source Hack Day: Building for Bangladesh",
      description:
        "Join fellow developers to build public good digital tools, local language NLP utilities, and civic tech solutions. Mentors from top tech firms will guide first-time contributors. Free stickers and snacks.",
      eventDate: days(8),
      venue: "North South University Auditorium, Bashundhara R/A, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      organizerId: rahim.id,
    },
    {
      title: "Intro to PostgreSQL Indexing & Query Tuning",
      description:
        "Interactive virtual masterclass on mastering PostgreSQL performance. Understand B-Tree vs GIN/BRIN indexes, reading EXPLAIN (ANALYZE, BUFFERS), vacuum tuning, and preventing connection pool exhaustion.",
      eventDate: days(11),
      venue: null,
      eventLink: "https://meet.google.com/xyz-planora-db-session",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Flutter & Dart Mobile Developers Jam 2026",
      description:
        "Hands-on live coding session creating sleek cross-platform applications with Flutter 3.x and Dart 3. Explore declarative routing, Riverpod 2.0 state management, and smooth 60fps animations.",
      eventDate: days(16),
      venue: null,
      eventLink: "https://zoom.us/j/9876543210",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80",
      organizerId: mahin.id,
    },
    {
      title: "Women in Tech Bangladesh: Inspiring Journeys",
      description:
        "An empowering afternoon featuring keynote talks and panel discussions with prominent female engineering managers, CTOs, and designers sharing actionable career growth advice and leadership journeys.",
      eventDate: days(19),
      venue: "BRAC University Multipurpose Hall, Merul Badda, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
      organizerId: ayesha.id,
    },
    {
      title: "Golang Bangladesh Community Meetup #07",
      description:
        "All about Go concurrency, goroutines, channels, memory allocation, and building microservices with high throughput and low memory footprint. Live benchmark breakdowns and live profiling demos.",
      eventDate: days(21),
      venue: "Grameenphone GPHouse Innovation Hub, Bashundhara R/A, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      organizerId: rahim.id,
    },
    {
      title: "Modern CSS & Tailwind v4 Architecture Workshop",
      description:
        "Master the next generation of modern CSS, cascade layers (@layer), container queries, CSS subgrid, and lightning-fast zero-config Vite tooling with Tailwind CSS version 4.",
      eventDate: days(23),
      venue: null,
      eventLink: "https://meet.google.com/modern-css-dhaka",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      organizerId: nusrat.id,
    },
    {
      title: "Dhaka AI Research Reading Group: Agentic Architectures",
      description:
        "Bi-weekly discussion group dissecting latest arXiv research papers on LLM agentic tool-use, multi-agent debates, test-time compute, and constitutional AI alignment. Perfect for ML researchers and hobbyists.",
      eventDate: days(26),
      venue: "EMK Center, Level 8, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "Chittagong Tech Innovators Community Hangout",
      description:
        "Port city tech gathering celebrating local developer talent, IT exporters, and creative entrepreneurs. Casual networking, tech sharing, and collaborative discussions about regional growth.",
      eventDate: days(29),
      venue: "Chittagong Club Grand Hall, Lalkhan Bazar, Chattogram",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "Git, GitHub & Clean PR Etiquette for Beginners",
      description:
        "Understand branching strategies, interactive rebasing, git bisect for bug hunting, and how to craft pull requests that maintainers love to review and merge instantly.",
      eventDate: days(31),
      venue: null,
      eventLink: "https://meet.google.com/git-clean-workflow",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Sylhet Tech Meetup: Remote Work & Freelance Growth",
      description:
        "Discover practical strategies to acquire international clients, ace async engineering interviews, manage payments, and achieve sustainable work-life harmony while working remotely from Sylhet.",
      eventDate: days(34),
      venue: "Rose View Hotel Convention Hall, Uposhohor, Sylhet",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Linux & Bash Power User Tricks for Developers",
      description:
        "Accelerate your terminal workflow: sed, awk, ripgrep, fzf, tmux sessions, custom shell scripts, and systemd service management. Level up your developer productivity effortlessly.",
      eventDate: days(37),
      venue: null,
      eventLink: "https://zoom.us/j/1122334455",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },
    {
      title: "Product Hunt Launch Playbook: 0 to #1 Product of the Day",
      description:
        "Learn step-by-step how Bangladeshi founders reached #1 Product of the Day on Product Hunt. Teardowns of copy, visuals, teaser trailers, hunter outreach, and global timezone mechanics.",
      eventDate: days(40),
      venue: null,
      eventLink: "https://meet.google.com/ph-playbook-bd",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Game Development with Godot Engine 4.3",
      description:
        "Build your first 2D/3D platformer game without hefty licensing costs! Learn scene trees, GDScript, physics nodes, particle systems, and web export pipelines with Godot 4.",
      eventDate: days(43),
      venue: "Daffodil Tower Auditorium, Dhanmondi 32, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      organizerId: mahin.id,
    },
    {
      title: "Web Accessibility (A11y) & Screen Reader Testing",
      description:
        "Hands-on demonstration on building inclusive web apps that comply with WCAG 2.2 AA standards. Practice navigating via keyboard-only, VoiceOver/NVDA, and automated accessibility auditing tools.",
      eventDate: days(46),
      venue: null,
      eventLink: "https://meet.google.com/a11y-web-standards",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
      organizerId: nusrat.id,
    },
    {
      title: "Introduction to Rust: Memory Safety Without Garbage Collection",
      description:
        "Curious about why industry leaders love Rust? Explore ownership, borrowing, lifetimes, pattern matching, error handling, and building blazing fast CLI utilities with cargo.",
      eventDate: days(49),
      venue: "EMK Center, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1516116211227-bbc601f78df8?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1516116211227-bbc601f78df8?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Micro-Frontend Architectures with Module Federation",
      description:
        "Unpack enterprise web architectures: independent deployments, shared state across MFEs, design token synchronization, and zero-downtime releases at scale.",
      eventDate: days(52),
      venue: null,
      eventLink: "https://meet.google.com/mfe-enterprise-talk",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Career Transition to Tech: Portfolio & Resume Surgery",
      description:
        "Live interactive portfolio reviews, LinkedIn profile optimizations, and advice on positioning non-traditional backgrounds to land software engineering and UX roles.",
      eventDate: days(55),
      venue: null,
      eventLink: "https://zoom.us/j/4455667788",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
      organizerId: ayesha.id,
    },
    {
      title: "Demystifying GraphQL: Schema Design & N+1 Solvers",
      description:
        "Build clean GraphQL APIs without common pitfalls: schema-first design, DataLoader batching, Apollo Federation, and caching strategies behind Cloudflare CDNs.",
      eventDate: days(58),
      venue: "North South University Library Gallery, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
      organizerId: rahim.id,
    },
    {
      title: "Fintech Innovations in South Asia: Open Banking & APIs",
      description:
        "Explore how interoperable payment ecosystems, real-time banking APIs, and digital wallet integrations are transforming commerce across South Asia.",
      eventDate: days(60),
      venue: "Pan Pacific Sonargaon Surma Hall, Karwan Bazar, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },

    // ------------------- PUBLIC PAID EVENTS (21 EVENTS) -------------------
    {
      title: "UI/UX Design Masterclass & Portfolio Review",
      description:
        "Intensive full-day workshop covering Design Systems in Figma, Component Libraries, Accessibility (WCAG 2.1), and 1-on-1 portfolio feedback sessions with industry design leads. Includes lunch and Figma design assets.",
      eventDate: days(7),
      venue: "Banani Club Banquet Hall, Road 11, Banani, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 800,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      organizerId: nusrat.id,
    },
    {
      title: "Full-Stack TypeScript & Prisma BootCamp",
      description:
        "Two-day weekend bootcamp building high-scale REST & GraphQL APIs using Node.js, TypeScript, Prisma ORM, and PostgreSQL. Deploying live on serverless infrastructure with automated CI/CD testing.",
      eventDate: days(10),
      venue: "Daffodil Tower, Level 5, Dhanmondi 32, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1200,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Cybersecurity & Ethical Hacking Symposium 2026",
      description:
        "Discover practical defense strategies against modern OWASP top 10 vulnerabilities, API security exploits, and zero-day threats. Live penetration testing demonstrations and bug bounty methodology teardowns included.",
      eventDate: days(13),
      venue: "Radisson Blu Dhaka Water Garden, Airport Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2000,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },
    {
      title: "Kubernetes in Production: Hands-on Cluster Architecture",
      description:
        "Deep dive into real-world Kubernetes: multi-cluster ingress, GitOps with ArgoCD, persistent volume topologies, horizontal pod autoscaling (HPA/KEDA), and cluster monitoring using Prometheus and Grafana.",
      eventDate: days(17),
      venue: "The Westin Dhaka, Grand Ballroom 2, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      organizerId: rahim.id,
    },
    {
      title: "AI Engineering & LLM Application Workshop",
      description:
        "Build production-grade LLM applications: RAG pipelines, vector embedding indexing with pgvector, LangChain/LlamaIndex agents, structured output parsing, and evaluation frameworks. Lunch and cloud GPU credits provided.",
      eventDate: days(22),
      venue: "InterContinental Dhaka, Crystal Ballroom, Minto Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1800,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "System Design for High Scale Services (100k+ RPS)",
      description:
        "A rigorous weekend system design intensive. Designing distributed rate limiters, message queues with Kafka, distributed transactions (Saga pattern), cache invalidation, and database sharding.",
      eventDate: days(25),
      venue: "EMK Center Conference Hall, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Mobile Game Art & Blender 3D Workshop",
      description:
        "Learn low-poly 3D modeling, UV unwrapping, hand-painted stylized texturing, and rigging for mobile games using Blender 4. Export seamlessly into Unity and Unreal Engine.",
      eventDate: days(28),
      venue: "Banani Club Studio, Road 11, Banani, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 900,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      organizerId: mahin.id,
    },
    {
      title: "Product Management BootCamp: From Discovery to Scale",
      description:
        "Learn user interviews, roadmapping, PRD writing, unit economics, OKR frameworks, and growth experiments used by top unicorns in Southeast Asia. Practical templates and case studies included.",
      eventDate: days(32),
      venue: "BRAC Centre Inn, 75 Mohakhali, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1400,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Certified Ethical Hacker (CEH) Defense Prep Camp",
      description:
        "Intensive security lab covering network scanning, vulnerability exploitation, wireless penetration testing, social engineering defense, and malware analysis in isolated sandboxes.",
      eventDate: days(35),
      venue: "North South University Lab Hall, Bashundhara, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2200,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },
    {
      title: "Data Engineering Masterclass: Spark & Apache Iceberg",
      description:
        "Build scalable modern data lakehouses using Apache Spark, Iceberg table formats, dbt transformations, and automated Airflow DAG orchestrations on cloud storage.",
      eventDate: days(38),
      venue: "Pan Pacific Sonargaon Meghna Hall, Karwan Bazar, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1750,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "React Native Performance & Native Module Bridge",
      description:
        "Turbocharge your React Native apps! Master the New Architecture, TurboModules, JSI bindings, Fabric renderer, and fixing thread bottlenecks in production apps.",
      eventDate: days(42),
      venue: "EMK Center, Level 8, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1100,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Brand Identity & Typography Masterclass",
      description:
        "Master the art of creating iconic digital brands: custom typographic hierarchy, color psychology, responsive logo design, and crafting complete brand guidelines in Illustrator and Figma.",
      eventDate: days(45),
      venue: "Banani Club Studio, Road 11, Banani, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 950,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      organizerId: nusrat.id,
    },
    {
      title: "Cloud Native Microservices with Docker & Terraform",
      description:
        "Architect resilient infrastructure as code with Terraform, containerize distributed services with multi-stage Docker builds, and set up automated secret management with HashiCorp Vault.",
      eventDate: days(48),
      venue: "Radisson Blu Dhaka Water Garden, Airport Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2100,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
      organizerId: rahim.id,
    },
    {
      title: "Fintech Growth & Algorithmic Trading Systems",
      description:
        "Design algorithmic trading backtests, order-book execution engines, risk metrics analysis, and high-frequency WebSocket data feeds using Python and C++.",
      eventDate: days(51),
      venue: "The Westin Dhaka, Grand Ballroom 1, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 3000,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "Web3 Smart Contract Security & Formal Verification",
      description:
        "Deep analysis of reentrancy bugs, flash loan attack vectors, front-running MEV, and using Foundry and Slither for automated static analysis of Solidity codebases.",
      eventDate: days(54),
      venue: "Daffodil Tower, Level 4, Dhanmondi, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1600,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },
    {
      title: "SEO & Content Marketing Engine for Tech Startups",
      description:
        "Transform technical content into a high-converting inbound customer engine: programmatic SEO, keyword clustering, technical site speed audits, and distribution strategies.",
      eventDate: days(57),
      venue: "EMK Center, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 750,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Unreal Engine 5: Photorealistic Environments & Nanite",
      description:
        "Create cinematic game environments using Unreal Engine 5.4, Lumen dynamic global illumination, Nanite virtualized geometry, and procedural content generation (PCG).",
      eventDate: days(62),
      venue: "BRAC University IT Labs, Merul Badda, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1350,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      organizerId: mahin.id,
    },
    {
      title: "Automated End-to-End Testing with Playwright & CI",
      description:
        "Build bulletproof test suites using Playwright, mock service workers (MSW), visual regression testing, cross-browser matrix runs, and GitHub Actions parallelization.",
      eventDate: days(65),
      venue: "North South University Hall 3, Bashundhara, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 850,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "SaaS Sales & B2B Customer Acquisition Bootcamp",
      description:
        "Tactical outbound sales playbook for enterprise SaaS: building lead lists, cold email deliverability, discovery calls that close, pilot contracting, and reducing churn.",
      eventDate: days(68),
      venue: "Pan Pacific Sonargaon Ballroom, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 2800,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "Applied Computer Vision with PyTorch & YOLOv10",
      description:
        "Train custom real-time object detection models for industrial inspection, video surveillance, and edge devices using PyTorch, YOLOv10, and TensorRT optimization.",
      eventDate: days(72),
      venue: "InterContinental Dhaka, Minto Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1950,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "Next-Gen Frontend State: Signals & React Query",
      description:
        "Ditch redundant re-renders! Learn fine-grained reactivity with Preact Signals, server state synchronization using TanStack Query v5, and optimistic UI mutations.",
      eventDate: days(75),
      venue: "EMK Center, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 650,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1581291518655-9523c932ecae?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1581291518655-9523c932ecae?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },

    // ------------------- PRIVATE FREE EVENTS (4 EVENTS) -------------------
    {
      title: "Dhaka Angel Investors & Startup Founders Dinner",
      description:
        "Exclusive closed-door networking dinner connecting pre-seed and seed-stage tech founders with angel syndicates and venture capital principals. Host approval required before venue details are revealed.",
      eventDate: days(18),
      venue: "Secret Private Lounge, Road 50, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "CTO Inner Circle: Engineering Scalability Roundtable",
      description:
        "Confidential roundtable for Chief Technology Officers and VP of Engineering leaders managing 50+ engineers. Frank discussions on technical debt, org design, compensation benchmarks, and AI adoption.",
      eventDate: days(27),
      venue: "The Westin Executive Suite, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Private Demo Day: Top Bangladeshi Incubator Cohort",
      description:
        "Private graduation demo day featuring 8 handpicked startups pitching directly to regional venture capital funds. Attendance by host invitation and accredited investor approval only.",
      eventDate: days(33),
      venue: "InterContinental Dhaka Boardroom, Minto Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Elite Red Team Security Briefing: Zero-Day Defenses",
      description:
        "Closed-door briefing for senior cybersecurity leads, banking CISOs, and defense specialists analyzing active threat actor campaigns, evasion techniques, and resilient mitigation protocols.",
      eventDate: days(44),
      venue: "Radisson Blu VIP Lounge, Airport Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },

    // ------------------- PRIVATE PAID EVENTS (4 EVENTS) -------------------
    {
      title: "Executive Leadership & Product Strategy Roundtable",
      description:
        "A high-impact executive cohort for VP of Engineering and Head of Product leaders. Limited to 20 seats with curated case studies, executive 1-on-1 coaching, and gourmet four-course dinner.",
      eventDate: days(24),
      venue: "The Westin Dhaka, Presidential Suite Dining, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 3500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "High-Net-Worth Tech Investors Private Summit",
      description:
        "Exclusive gathering for high-net-worth individuals and family offices exploring direct allocations in early-stage tech, cross-border venture funds, and pre-IPO secondary transactions.",
      eventDate: days(36),
      venue: "Radisson Blu Water Garden, Grand Suite, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 5000,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "AI Startup Founders Mastermind: Scaling to $10M ARR",
      description:
        "Intimate retreat for funded AI founders. Topics include GPU cost unit economics, enterprise sales cycles, defensibility against hyperscalers, and talent retention. All meals and retreat included.",
      eventDate: days(47),
      venue: "Pan Pacific Sonargaon VIP Lounge, Karwan Bazar, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 4500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "Advanced Zero-Trust Enterprise Security Mastermind",
      description:
        "Intensive closed-door simulation for enterprise security heads: breach response war games, supply chain attack containment, and cloud security posture hardening.",
      eventDate: days(60),
      venue: "InterContinental Dhaka Executive Club, Minto Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PRIVATE,
      fee: 3800,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },

    // ------------------- PAST EVENTS FOR REVIEWS & HISTORY (8 EVENTS) -------------------
    {
      title: "DevOps & Cloud Native Dhaka 2026 (Winter Edition)",
      description:
        "A comprehensive gathering covering Kubernetes cluster management, Docker containerization, CI/CD pipelines with GitHub Actions, and GitOps workflows in production environments.",
      eventDate: pastDays(10),
      venue: "Independent University Bangladesh (IUB) Auditorium, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Dhaka JavaScript & TypeScript Summit 2025",
      description:
        "Full-day conference exploring ECMAScript evolution, Node.js performance profiling, Bun runtime deep dives, and modern enterprise frontend architecture.",
      eventDate: pastDays(20),
      venue: "Bangabandhu International Conference Center (BICC), Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1000,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      organizerId: tanvir.id,
    },
    {
      title: "Design Systems & Figma Config Dhaka 2025",
      description:
        "Hands-on workshop exploring Figma Variables, Design Tokens, Auto-layout v5, and seamless handoff pipelines for development teams.",
      eventDate: pastDays(25),
      venue: "Banani Club Hall, Road 11, Banani, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 700,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      organizerId: nusrat.id,
    },
    {
      title: "Bangladesh National Cyber Hackathon 2025",
      description:
        "48-hour competitive Capture The Flag (CTF) hackathon with teams tackling cryptography, reverse engineering, web exploitation, and binary puzzles.",
      eventDate: pastDays(32),
      venue: "North South University Auditorium, Bashundhara, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 400,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      organizerId: arif.id,
    },
    {
      title: "Applied Machine Learning & NLP Conference",
      description:
        "Exploring transformer models, low-rank adaptation (LoRA), fine-tuning small language models, and practical Bengali speech synthesis.",
      eventDate: pastDays(40),
      venue: "Radisson Blu Dhaka Water Garden, Airport Road, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 1500,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      organizerId: farhan.id,
    },
    {
      title: "Startup Founders Pitch Night: Winter Cohort",
      description:
        "10 fast-growing Bangladeshi startups pitched their seed rounds in front of 120+ active investors, followed by networking dinner.",
      eventDate: pastDays(45),
      venue: "The Westin Dhaka Grand Ballroom, Gulshan-2, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 600,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      organizerId: tasnim.id,
    },
    {
      title: "Product Analytics & Growth Experiments Workshop",
      description:
        "A practical session on setting up Mixpanel, PostHog, event instrumentation, funnel dropout analysis, and calculating LTV/CAC ratios.",
      eventDate: pastDays(55),
      venue: null,
      eventLink: "https://meet.google.com/past-analytics-workshop",
      visibility: Visibility.PUBLIC,
      fee: 0,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      organizerId: sadia.id,
    },
    {
      title: "Intro to Mobile Game Production & Monetization",
      description:
        "Case studies on indie game publishing: rewarded ads vs in-app purchases, retention curves (D1, D7, D30), and user acquisition tactics.",
      eventDate: pastDays(65),
      venue: "EMK Center, Gulshan-1, Dhaka",
      eventLink: null,
      visibility: Visibility.PUBLIC,
      fee: 350,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      organizerId: mahin.id,
    },
  ];

  console.log(`\n📦 Total Events Prepared to Seed: ${allEventsData.length}\n`);

  const createdEvents: Record<string, any> = {};

  for (const ed of allEventsData) {
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
    createdEvents[ed.title] = ev;
    console.log(`  🎪 [${Object.keys(createdEvents).length}/50] Event Ready: "${ev.title}" (${ev.visibility}, ${ev.fee} BDT)`);
  }

  // --------------------------------------------------------------------------
  // 4. Seed Participations Across Past & Upcoming Events
  // --------------------------------------------------------------------------
  const pastDevOps = createdEvents["DevOps & Cloud Native Dhaka 2026 (Winter Edition)"];
  const pastJsSummit = createdEvents["Dhaka JavaScript & TypeScript Summit 2025"];
  const pastDesign = createdEvents["Design Systems & Figma Config Dhaka 2025"];
  const pastCyber = createdEvents["Bangladesh National Cyber Hackathon 2025"];
  const techSummit = createdEvents["Tech Summit Bangladesh 2026"];
  const reactMeetup = createdEvents["Dhaka React & Next.js Meetup #14"];
  const designMasterclass = createdEvents["UI/UX Design Masterclass & Portfolio Review"];
  const angelDinner = createdEvents["Dhaka Angel Investors & Startup Founders Dinner"];
  const execRoundtable = createdEvents["Executive Leadership & Product Strategy Roundtable"];

  const participationsData = [
    // Past DevOps event participants (APPROVED so they can write reviews per BR-35)
    { eventId: pastDevOps.id, userId: rahim.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(11) },
    { eventId: pastDevOps.id, userId: sadia.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(11) },
    { eventId: pastDevOps.id, userId: arif.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(11) },
    { eventId: pastDevOps.id, userId: farhan.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(11) },
    { eventId: pastDevOps.id, userId: samim.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(11) },

    // Past JS Summit participants
    { eventId: pastJsSummit.id, userId: nusrat.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(21) },
    { eventId: pastJsSummit.id, userId: mahin.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(21) },
    { eventId: pastJsSummit.id, userId: ayesha.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(21) },
    { eventId: pastJsSummit.id, userId: samim.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(21) },

    // Past Design Systems participants
    { eventId: pastDesign.id, userId: sadia.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(26) },
    { eventId: pastDesign.id, userId: tanvir.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(26) },
    { eventId: pastDesign.id, userId: ayesha.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(26) },

    // Past Cyber Hackathon participants
    { eventId: pastCyber.id, userId: rahim.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(33) },
    { eventId: pastCyber.id, userId: farhan.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(33) },
    { eventId: pastCyber.id, userId: mahin.id, status: ParticipationStatus.APPROVED, decidedAt: pastDays(33) },

    // Flagship Tech Summit participants (Upcoming Public Paid)
    { eventId: techSummit.id, userId: nusrat.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: techSummit.id, userId: rahim.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: techSummit.id, userId: sadia.id, status: ParticipationStatus.PENDING, decidedAt: null },
    { eventId: techSummit.id, userId: farhan.id, status: ParticipationStatus.PENDING, decidedAt: null },

    // React Meetup participants (Public Free -> APPROVED)
    { eventId: reactMeetup.id, userId: rahim.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: reactMeetup.id, userId: sadia.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: reactMeetup.id, userId: arif.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: reactMeetup.id, userId: samim.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },

    // UI/UX Masterclass (Public Paid)
    { eventId: designMasterclass.id, userId: sadia.id, status: ParticipationStatus.APPROVED, decidedAt: days(2) },
    { eventId: designMasterclass.id, userId: ayesha.id, status: ParticipationStatus.PENDING, decidedAt: null },

    // Angel Dinner (Private Free)
    { eventId: angelDinner.id, userId: sadia.id, status: ParticipationStatus.APPROVED, decidedAt: days(2) },
    { eventId: angelDinner.id, userId: tanvir.id, status: ParticipationStatus.PENDING, decidedAt: null },
    { eventId: angelDinner.id, userId: arif.id, status: ParticipationStatus.REJECTED, decidedAt: days(1) },

    // Executive Roundtable (Private Paid)
    { eventId: execRoundtable.id, userId: tasnim.id, status: ParticipationStatus.APPROVED, decidedAt: days(1) },
    { eventId: execRoundtable.id, userId: farhan.id, status: ParticipationStatus.PENDING, decidedAt: null },
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
  console.log(`\n  🎟️ Participations Seeded (${participationsData.length} records)`);

  // --------------------------------------------------------------------------
  // 5. Seed Reviews on Past Events (per BR-35: Approved participants only)
  // --------------------------------------------------------------------------
  const reviewsData = [
    {
      eventId: pastDevOps.id,
      userId: rahim.id,
      rating: 5,
      comment:
        "Incredible hands-on workshop! The Kubernetes multi-cluster architecture session was worth every penny. Looking forward to the next edition.",
    },
    {
      eventId: pastDevOps.id,
      userId: sadia.id,
      rating: 5,
      comment:
        "Very well organized, high quality speakers, and delicious food. Learned a ton about modern GitOps with ArgoCD.",
    },
    {
      eventId: pastDevOps.id,
      userId: arif.id,
      rating: 4,
      comment:
        "Great practical content on Docker hardening and Helm chart templating. Networking sessions were top tier.",
    },
    {
      eventId: pastDevOps.id,
      userId: farhan.id,
      rating: 5,
      comment:
        "The live Prometheus and Grafana alerting demonstration was eye-opening. Clean presentation and great Q&A.",
    },
    {
      eventId: pastJsSummit.id,
      userId: nusrat.id,
      rating: 5,
      comment:
        "Loved the deep dive into ECMAScript proposals and Bun runtime performance benchmarks. Highly inspiring!",
    },
    {
      eventId: pastJsSummit.id,
      userId: mahin.id,
      rating: 4,
      comment:
        "Solid insights on state management and building responsive cross-platform architectures. Great crowd!",
    },
    {
      eventId: pastJsSummit.id,
      userId: ayesha.id,
      rating: 5,
      comment:
        "One of the best developer conferences held at BICC! The networking lounge sparked several collaboration opportunities.",
    },
    {
      eventId: pastDesign.id,
      userId: sadia.id,
      rating: 5,
      comment:
        "Nusrat's guidance on Figma design tokens and component libraries simplified our entire product workflow. 10/10!",
    },
    {
      eventId: pastDesign.id,
      userId: ayesha.id,
      rating: 5,
      comment:
        "The portfolio review session gave me direct, actionable feedback that helped me refine my design case studies.",
    },
    {
      eventId: pastCyber.id,
      userId: rahim.id,
      rating: 5,
      comment:
        "Challenging CTF challenges! The binary reverse-engineering tracks really tested our problem solving limits.",
    },
    {
      eventId: pastCyber.id,
      userId: farhan.id,
      rating: 4,
      comment:
        "Super intense 48-hour event. Well moderated, fair judging, and wonderful teamwork atmosphere.",
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
  console.log(`  ⭐ Reviews Seeded (${reviewsData.length} reviews on past events)`);

  // --------------------------------------------------------------------------
  // 6. Seed Invitations
  // --------------------------------------------------------------------------
  const invitationsData = [
    {
      eventId: angelDinner.id,
      inviteeId: arif.id,
      status: InvitationStatus.PENDING,
      respondedAt: null,
    },
    {
      eventId: createdEvents["Full-Stack TypeScript & Prisma BootCamp"].id,
      inviteeId: arif.id,
      status: InvitationStatus.PENDING,
      respondedAt: null,
    },
    {
      eventId: execRoundtable.id,
      inviteeId: nusrat.id,
      status: InvitationStatus.ACCEPTED,
      respondedAt: days(1),
    },
    {
      eventId: createdEvents["AI Engineering & LLM Application Workshop"].id,
      inviteeId: samim.id,
      status: InvitationStatus.ACCEPTED,
      respondedAt: days(1),
    },
    {
      eventId: createdEvents["Cybersecurity & Ethical Hacking Symposium 2026"].id,
      inviteeId: mahin.id,
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
  console.log(`  💌 Invitations Seeded (${invitationsData.length} invitations)`);

  // --------------------------------------------------------------------------
  // 7. Seed Payments
  // --------------------------------------------------------------------------
  const paymentsData = [
    {
      tranId: "PLN-DEMO-DEVOPS-01",
      userId: rahim.id,
      eventId: pastDevOps.id,
      eventTitle: pastDevOps.title,
      amount: pastDevOps.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_DEVOPS_01",
      bankTranId: "BANK_DEVOPS_01",
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
      valId: "VAL_DESIGN_02",
      bankTranId: "BANK_DESIGN_02",
      paidAt: days(1),
    },
    {
      tranId: "PLN-DEMO-SUMMIT-03",
      userId: nusrat.id,
      eventId: techSummit.id,
      eventTitle: techSummit.title,
      amount: techSummit.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_SUMMIT_03",
      bankTranId: "BANK_SUMMIT_03",
      paidAt: days(1),
    },
    {
      tranId: "PLN-DEMO-JSSUMMIT-04",
      userId: mahin.id,
      eventId: pastJsSummit.id,
      eventTitle: pastJsSummit.title,
      amount: pastJsSummit.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_JSSUMMIT_04",
      bankTranId: "BANK_JSSUMMIT_04",
      paidAt: pastDays(21),
    },
    {
      tranId: "PLN-DEMO-EXEC-05",
      userId: tasnim.id,
      eventId: execRoundtable.id,
      eventTitle: execRoundtable.title,
      amount: execRoundtable.fee,
      currency: "BDT",
      status: PaymentStatus.SUCCESS,
      gateway: "SSLCOMMERZ",
      valId: "VAL_EXEC_05",
      bankTranId: "BANK_EXEC_05",
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

  console.log("\n✨ [SEEDING COMPLETE] 50 Events, 10 Hosts, Participations, Reviews, and Payments Successfully Populated!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
