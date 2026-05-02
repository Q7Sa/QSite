// Add projects here — no HTML editing needed.
// Drop it in the right service key, fill in title/desc for both languages.
// image: path relative to /public (e.g. '/projects/d3m-opt.png'), or null for placeholder
// client: collab logo filename without extension (shown as a badge on the tile)

export const projects = {
  optimization: [
    {
      title: { ltr: 'D3MCRAFT-S3 Optimization', rtl: 'تحسين سيرفر D3MCRAFT-S3' },
      desc:  { ltr: 'Resolved TPS drops on a high-population Paper 1.20 server.', rtl: 'حل مشاكل انخفاض TPS على سيرفر Paper 1.20 بعدد لاعبين كبير.' },
      image: null,
      client: 'D3MCRAFT-S3',
    },
    {
      title: { ltr: 'D3MCRAFT-S4 Optimization', rtl: 'تحسين سيرفر D3MCRAFT-S4' },
      desc:  { ltr: 'JVM flag tuning and async plugin migration.', rtl: 'ضبط JVM flags وترحيل إضافات إلى النمط غير المتزامن.' },
      image: null,
      client: 'D3MCRAFT-S4',
    },
  ],

  datapacks: [
    {
      title: { ltr: 'FanoosCraft Custom Pack', rtl: 'داتاباك مخصص لـ FanoosCraft' },
      desc:  { ltr: 'Custom mechanics and progression systems for FanoosCraft SMP.', rtl: 'أنظمة ميكانيكيات وتطور مخصصة لـ FanoosCraft SMP.' },
      image: null,
      client: 'FanoosCraft',
    },
  ],

  smp: [
    {
      title: { ltr: 'Wildcraft SMP Setup', rtl: 'تجهيز سيرفر Wildcraft SMP' },
      desc:  { ltr: 'Full SMP with economy, custom terrain, and rank systems.', rtl: 'إعداد كامل مع نظام اقتصادي وتضاريس مخصصة وأنظمة رتب.' },
      image: null,
      client: 'wildmc',
    },
  ],
};
