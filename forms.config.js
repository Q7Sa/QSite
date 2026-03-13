// Centralized configuration for all dynamic forms on the site.
// Add, remove, or edit questions here without touching the HTML.

export const formConfigs = {
    // 1. General Suggestion Form (Always available from footer/main button)
    suggestion: {
        title: { ltr: 'Support Suggestions', rtl: 'اقتراحات الدعم' },
        steps: [
            {
                id: 'name',
                type: 'text',
                label: { ltr: '1. What is your name?', rtl: '1. ما اسمك؟' },
                placeholder: { ltr: 'Enter your name here...', rtl: 'ادخل اسمك هنا...' },
                required: true
            },
            {
                id: 'title',
                type: 'text',
                label: { ltr: '2. Suggestion Title?', rtl: '2. ما هو عنوان الاقتراح؟' },
                placeholder: { ltr: 'Brief title...', rtl: 'عنوان مختصر...' },
                required: true
            },
            {
                id: 'details',
                type: 'textarea',
                label: { ltr: '3. Suggestion Details', rtl: '3. تفاصيل الاقتراح' },
                placeholder: { ltr: 'Explain your idea in detail...', rtl: 'اشرح فكرتك بالتفصيل...' },
                required: true
            }
        ]
    },

    // 2. Server Optimization Service Request
    service_optimization: {
        title: { ltr: 'Optimization Request', rtl: 'طلب تحسين السيرفر' },
        steps: [
            {
                id: 'discord',
                type: 'text',
                label: { ltr: '1. Discord Username', rtl: '1. حسابك في ديسكورد' },
                placeholder: { ltr: 'User#1234', rtl: 'User#1234' },
                required: true
            },
            {
                id: 'server_type',
                type: 'text',
                label: { ltr: '2. Server Type & Version', rtl: '2. نوع السيرفر وإصداره' },
                placeholder: { ltr: 'Paper 1.20.4, Fabric...', rtl: 'Paper 1.20.4, Fabric...' },
                required: true
            },
            {
                id: 'issues',
                type: 'textarea',
                label: { ltr: '3. Current Lag Issues', rtl: '3. مشاكل اللاق الحالية' },
                placeholder: { ltr: 'Describe your TPS drops...', rtl: 'اشرح متى يهبط الـ TPS...' },
                required: true
            }
        ]
    },

    // 3. Custom Datapack Service Request
    service_datapacks: {
        title: { ltr: 'Datapack Commission', rtl: 'طلب داتاباك مخصص' },
        steps: [
            {
                id: 'discord',
                type: 'text',
                label: { ltr: '1. Discord Username', rtl: '1. حسابك في ديسكورد' },
                placeholder: { ltr: 'User#1234', rtl: 'User#1234' },
                required: true
            },
            {
                id: 'pack_idea',
                type: 'textarea',
                label: { ltr: '2. Describe Your Idea', rtl: '2. اشرح فكرة الداتاباك' },
                placeholder: { ltr: 'I need a custom mechanic that...', rtl: 'أحتاج نظام مخصص يقوم بـ...' },
                required: true
            }
        ]
    },

    // 4. SMP Setup Service Request
    service_smp: {
        title: { ltr: 'SMP Setup Request', rtl: 'طلب تجهيز سيرفر SMP' },
        steps: [
            {
                id: 'discord',
                type: 'text',
                label: { ltr: '1. Discord Username', rtl: '1. حسابك في ديسكورد' },
                placeholder: { ltr: 'User#1234', rtl: 'User#1234' },
                required: true
            },
            {
                id: 'tier',
                type: 'text',
                label: { ltr: '2. Which Tier?', rtl: '2. أي باقة تريد؟' },
                placeholder: { ltr: 'Standard or Premium?', rtl: 'ستاندرد أم بريميوم؟' },
                required: true
            },
            {
                id: 'vision',
                type: 'textarea',
                label: { ltr: '3. Server Vision', rtl: '3. تخيلك للسيرفر' },
                placeholder: { ltr: 'Economy focused, vanilla tweaks...', rtl: 'نظام اقتصادي، إضافات بسيطة...' },
                required: true
            }
        ]
    }
};
