/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │  SALES CONFIG — edit these values to customize your store.  │
 * │  The landing page (app/landing/page.tsx) reads from here.   │
 * └─────────────────────────────────────────────────────────────┘
 */

export interface SalesConfig {
  productName: string;
  tagline: string;
  /** WhatsApp number in international format, digits only (e.g. 967777123456) */
  whatsapp: string;
  email: string;
  telegram?: string;
  /** Direct payment links (create in Stripe / Moyasar / Tap and paste here) */
  paymentLinks: {
    stripe?: string; // international cards
    moyasar?: string; // Saudi/Gulf (mada, Apple Pay)
    tap?: string;
  };
  /** Price tiers shown on the landing page */
  prices: {
    currency: string;
    symbol: string;
    oneTime: number; // single payment
    note?: string;
  }[];
  features: { icon: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
  faq: { q: string; a: string }[];
}

export const salesConfig: SalesConfig = {
  productName: "Spending Tracker",
  tagline: "تتبّع أموالك بأناقة — تطبيق المصروفات الأكثر احترافية",
  // 👇 غيّر هذا لرقم واتسابك (بصيغة دولية بدون +)
  whatsapp: "967777123456",
  email: "sales@spendingtracker.app",
  telegram: "",
  paymentLinks: {
    // اتركها فارغة حتى تنشئ روابط الدفع، أو الصقها هنا
    stripe: "",
    moyasar: "",
    tap: "",
  },
  prices: [
    { currency: "YER", symbol: "﷼", oneTime: 3500, note: "اليمن — تحويل/محفظة" },
    { currency: "SAR", symbol: "ر.س", oneTime: 25, note: "السعودية — مدى/Apple Pay" },
    { currency: "USD", symbol: "$", oneTime: 7.99, note: "دولي — بطاقة" },
  ],
  features: [
    { icon: "LayoutDashboard", title: "لوحة تحكم ذكية", desc: "بطاقات ملخصة متحركة ورسوم بيانية تفاعلية تظهر صورة أموالك بلمحة." },
    { icon: "ArrowLeftRight", title: "معاملات قوية", desc: "بحث وتصفية وترتيب وتصدير CSV/Excel، مع تكرار وتفضيل وإدارة جماعية." },
    { icon: "Wallet", title: "ميزانيات ذكية", desc: "حدود شهرية/أسبوعية لكل فئة مع تنبيهات عند الاقتراب من الحد أو تجاوزه." },
    { icon: "Target", title: "أهداف ادخار", desc: "حوّل أحلامك لإنجازات مع حلقات تقدّم متحركة ومواعيد نهائية." },
    { icon: "CalendarDays", title: "تقويم المصروفات", desc: "تصوّر إنفاقك يومياً بخريطة حرارية تفاعلية." },
    { icon: "BarChart3", title: "تقارير ورؤى", desc: "ملخصات أسبوعية وشهرية وسنوية مع رؤى ذكية وتصدير للملفات." },
    { icon: "Globe", title: "7 عملات", desc: "USD, EUR, GBP, SAR, AED, YER, JPY — وإضافة عملة جديدة بأمر واحد." },
    { icon: "Languages", title: "عربي وإنجليزي", desc: "دعم كامل للغة العربية مع تخطيط RTL صحيح." },
    { icon: "ShieldCheck", title: "خصوصية تامة", desc: "بياناتك تبقى على هاتفك فقط — بدون خادم، بدون حسابات، بدون إعلانات." },
  ],
  stats: [
    { value: "100%", label: "يعمل بلا إنترنت" },
    { value: "0", label: "إعلانات أو تتبّع" },
    { value: "7", label: "عملات مدعومة" },
    { value: "∞", label: "معاملات بلا حدود" },
  ],
  faq: [
    { q: "هل يحتاج التطبيق إنترنت؟", a: "لا. يعمل التطبيق بالكامل بلا اتصال، وبياناتك محفوظة على جهازك فقط." },
    { q: "كيف أحصل على التطبيق بعد الدفع؟", a: "بعد تأكيد الدفع نرسل لك ملف التطبيق (APK) ورقم الترخيص لتثبّته وتفعّله." },
    { q: "هل بياناتي آمنة؟", a: "نعم. لا يوجد خادم ولا حساب — كل معلوماتك المالية تبقى محلية على هاتفك." },
    { q: "هل يدعم التطبيق لغتي؟", a: "نعم، يدعم العربية والإنجليزية بالكامل مع تخطيط من اليمين لليسار." },
  ],
};
