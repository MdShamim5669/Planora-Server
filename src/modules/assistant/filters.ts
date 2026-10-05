import { Filters } from "./assistant.interface";

const DHAKA = 6 * 3600e3;
const DAY = 86400e3;

const startOfDhakaDay = (d: Date) => {
  const s = new Date(d.getTime() + DHAKA);
  s.setUTCHours(0, 0, 0, 0);
  return new Date(s.getTime() - DHAKA);
};

export function parseFilters(q: string, now: Date): Filters {
  const t = q.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  const f: Filters = { fee: null, visibility: null, from: now, to: null };

  if (has("free", "ফ্রি", "বিনামূল্যে", "0 taka", "free event")) {
    f.fee = "FREE";
  } else if (has("paid", "টাকা", "fee", "cost", "paid event")) {
    f.fee = "PAID";
  }

  if (has("private", "প্রাইভেট", "invite only", "exclusive")) {
    f.visibility = "PRIVATE";
  } else if (has("public", "পাবলিক", "open")) {
    f.visibility = "PUBLIC";
  }

  const today = startOfDhakaDay(now);
  const dow = new Date(now.getTime() + DHAKA).getUTCDay(); // 0=Sun ... 5=Fri, 6=Sat

  if (has("weekend", "সপ্তাহান্ত", "shoptaho", "friday", "saturday")) {
    const fri =
      dow === 6
        ? new Date(today.getTime() - DAY)
        : new Date(today.getTime() + ((5 - dow + 7) % 7) * DAY);
    f.from = new Date(Math.max(now.getTime(), fri.getTime()));
    f.to = new Date(fri.getTime() + 2 * DAY);
  } else if (has("tomorrow", "agamikal", "আগামীকাল", "কাল", "agami kal")) {
    f.from = new Date(today.getTime() + DAY);
    f.to = new Date(today.getTime() + 2 * DAY);
  } else if (has("today", "ajke", "আজ", "aj")) {
    f.to = new Date(today.getTime() + DAY);
  } else if (has("next week", "porer shoptah")) {
    f.from = new Date(today.getTime() + 7 * DAY);
    f.to = new Date(today.getTime() + 14 * DAY);
  } else if (has("this week", "ei shoptahe", "ei shoptah")) {
    f.to = new Date(today.getTime() + 7 * DAY);
  }

  return f;
}
