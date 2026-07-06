import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      dashboard: "Dashboard", services: "Services", addFunds: "Add Funds", orderHistory: "Order History",
      howToUse: "How to Use", apiPortal: "API Portal", feedback: "Feedback", settings: "Settings",
      support: "Support", loyaltyTier: "Loyalty Tier", aboutUs: "About Us", adminPanel: "Admin Panel",
      logout: "Logout", telegram: "Telegram", balance: "Balance", welcome: "Welcome back",
      newOrder: "New Order", wallet: "Wallet", completed: "Completed", tier: "Tier",
      needHelp: "Need help? Reach out to us", placeOrder: "Place Order", totalCost: "Total Cost",
      notifications: "Notifications", noNotifications: "No notifications yet", markAllRead: "Mark all read",
      darkMode: "Dark Mode", lightMode: "Light Mode", language: "Language",
    },
  },
  es: {
    translation: {
      dashboard: "Panel", services: "Servicios", addFunds: "Agregar Fondos", orderHistory: "Historial de Pedidos",
      howToUse: "Cómo Usar", apiPortal: "Portal API", feedback: "Opiniones", settings: "Configuración",
      support: "Soporte", loyaltyTier: "Nivel de Lealtad", aboutUs: "Sobre Nosotros", adminPanel: "Panel Admin",
      logout: "Cerrar Sesión", telegram: "Telegram", balance: "Saldo", welcome: "Bienvenido de nuevo",
      newOrder: "Nuevo Pedido", wallet: "Billetera", completed: "Completado", tier: "Nivel",
      needHelp: "¿Necesitas ayuda? Contáctanos", placeOrder: "Realizar Pedido", totalCost: "Costo Total",
      notifications: "Notificaciones", noNotifications: "Sin notificaciones", markAllRead: "Marcar todo leído",
      darkMode: "Modo Oscuro", lightMode: "Modo Claro", language: "Idioma",
    },
  },
  fr: {
    translation: {
      dashboard: "Tableau de bord", services: "Services", addFunds: "Ajouter des fonds", orderHistory: "Historique",
      howToUse: "Comment utiliser", apiPortal: "Portail API", feedback: "Avis", settings: "Paramètres",
      support: "Support", loyaltyTier: "Niveau de fidélité", aboutUs: "À propos", adminPanel: "Admin",
      logout: "Déconnexion", telegram: "Telegram", balance: "Solde", welcome: "Bon retour",
      newOrder: "Nouvelle commande", wallet: "Portefeuille", completed: "Terminé", tier: "Niveau",
      needHelp: "Besoin d'aide? Contactez-nous", placeOrder: "Commander", totalCost: "Coût total",
      notifications: "Notifications", noNotifications: "Pas de notifications", markAllRead: "Tout marquer lu",
      darkMode: "Mode sombre", lightMode: "Mode clair", language: "Langue",
    },
  },
  de: {
    translation: {
      dashboard: "Dashboard", services: "Dienste", addFunds: "Guthaben aufladen", orderHistory: "Bestellverlauf",
      howToUse: "Anleitung", apiPortal: "API-Portal", feedback: "Feedback", settings: "Einstellungen",
      support: "Support", loyaltyTier: "Treuestufe", aboutUs: "Über uns", adminPanel: "Admin",
      logout: "Abmelden", telegram: "Telegram", balance: "Guthaben", welcome: "Willkommen zurück",
      newOrder: "Neue Bestellung", wallet: "Geldbörse", completed: "Abgeschlossen", tier: "Stufe",
      needHelp: "Hilfe benötigt? Kontaktieren Sie uns", placeOrder: "Bestellen", totalCost: "Gesamtkosten",
      notifications: "Benachrichtigungen", noNotifications: "Keine Benachrichtigungen", markAllRead: "Alle gelesen",
      darkMode: "Dunkelmodus", lightMode: "Hellmodus", language: "Sprache",
    },
  },
  pt: {
    translation: {
      dashboard: "Painel", services: "Serviços", addFunds: "Adicionar Fundos", orderHistory: "Histórico",
      howToUse: "Como Usar", apiPortal: "Portal API", feedback: "Avaliação", settings: "Configurações",
      support: "Suporte", loyaltyTier: "Nível de Fidelidade", aboutUs: "Sobre Nós", adminPanel: "Admin",
      logout: "Sair", telegram: "Telegram", balance: "Saldo", welcome: "Bem-vindo de volta",
      newOrder: "Novo Pedido", wallet: "Carteira", completed: "Concluído", tier: "Nível",
      needHelp: "Precisa de ajuda? Fale conosco", placeOrder: "Fazer Pedido", totalCost: "Custo Total",
      notifications: "Notificações", noNotifications: "Sem notificações", markAllRead: "Marcar tudo lido",
      darkMode: "Modo Escuro", lightMode: "Modo Claro", language: "Idioma",
    },
  },
  ar: {
    translation: {
      dashboard: "لوحة التحكم", services: "الخدمات", addFunds: "إضافة رصيد", orderHistory: "سجل الطلبات",
      howToUse: "كيفية الاستخدام", apiPortal: "بوابة API", feedback: "التقييمات", settings: "الإعدادات",
      support: "الدعم", loyaltyTier: "مستوى الولاء", aboutUs: "من نحن", adminPanel: "لوحة الإدارة",
      logout: "تسجيل الخروج", telegram: "تيليجرام", balance: "الرصيد", welcome: "مرحباً بعودتك",
      newOrder: "طلب جديد", wallet: "المحفظة", completed: "مكتمل", tier: "المستوى",
      needHelp: "تحتاج مساعدة؟ تواصل معنا", placeOrder: "تقديم الطلب", totalCost: "التكلفة الإجمالية",
      notifications: "الإشعارات", noNotifications: "لا توجد إشعارات", markAllRead: "تحديد الكل كمقروء",
      darkMode: "الوضع الداكن", lightMode: "الوضع الفاتح", language: "اللغة",
    },
  },
  hi: {
    translation: {
      dashboard: "डैशबोर्ड", services: "सेवाएं", addFunds: "फंड जोड़ें", orderHistory: "ऑर्डर इतिहास",
      howToUse: "कैसे उपयोग करें", apiPortal: "API पोर्टल", feedback: "प्रतिक्रिया", settings: "सेटिंग्स",
      support: "सहायता", loyaltyTier: "वफादारी स्तर", aboutUs: "हमारे बारे में", adminPanel: "एडमिन पैनल",
      logout: "लॉग आउट", telegram: "टेलीग्राम", balance: "शेष राशि", welcome: "वापसी पर स्वागत",
      newOrder: "नया ऑर्डर", wallet: "वॉलेट", completed: "पूर्ण", tier: "स्तर",
      needHelp: "मदद चाहिए? हमसे संपर्क करें", placeOrder: "ऑर्डर दें", totalCost: "कुल लागत",
      notifications: "सूचनाएं", noNotifications: "कोई सूचना नहीं", markAllRead: "सभी पढ़ा हुआ",
      darkMode: "डार्क मोड", lightMode: "लाइट मोड", language: "भाषा",
    },
  },
  zh: {
    translation: {
      dashboard: "仪表板", services: "服务", addFunds: "充值", orderHistory: "订单记录",
      howToUse: "使用方法", apiPortal: "API门户", feedback: "反馈", settings: "设置",
      support: "客服", loyaltyTier: "忠诚等级", aboutUs: "关于我们", adminPanel: "管理面板",
      logout: "退出", telegram: "Telegram", balance: "余额", welcome: "欢迎回来",
      newOrder: "新订单", wallet: "钱包", completed: "已完成", tier: "等级",
      needHelp: "需要帮助？联系我们", placeOrder: "下单", totalCost: "总费用",
      notifications: "通知", noNotifications: "暂无通知", markAllRead: "全部已读",
      darkMode: "深色模式", lightMode: "浅色模式", language: "语言",
    },
  },
  ja: {
    translation: {
      dashboard: "ダッシュボード", services: "サービス", addFunds: "入金", orderHistory: "注文履歴",
      howToUse: "使い方", apiPortal: "APIポータル", feedback: "フィードバック", settings: "設定",
      support: "サポート", loyaltyTier: "ロイヤルティ", aboutUs: "会社概要", adminPanel: "管理パネル",
      logout: "ログアウト", telegram: "Telegram", balance: "残高", welcome: "おかえりなさい",
      newOrder: "新規注文", wallet: "ウォレット", completed: "完了", tier: "ランク",
      needHelp: "お困りですか？お問い合わせください", placeOrder: "注文する", totalCost: "合計",
      notifications: "通知", noNotifications: "通知はありません", markAllRead: "すべて既読",
      darkMode: "ダークモード", lightMode: "ライトモード", language: "言語",
    },
  },
  ko: {
    translation: {
      dashboard: "대시보드", services: "서비스", addFunds: "충전", orderHistory: "주문 내역",
      howToUse: "사용 방법", apiPortal: "API 포털", feedback: "피드백", settings: "설정",
      support: "지원", loyaltyTier: "등급", aboutUs: "소개", adminPanel: "관리자",
      logout: "로그아웃", telegram: "텔레그램", balance: "잔액", welcome: "돌아오신 것을 환영합니다",
      newOrder: "새 주문", wallet: "지갑", completed: "완료", tier: "등급",
      needHelp: "도움이 필요하세요?", placeOrder: "주문하기", totalCost: "총 비용",
      notifications: "알림", noNotifications: "알림 없음", markAllRead: "모두 읽음",
      darkMode: "다크 모드", lightMode: "라이트 모드", language: "언어",
    },
  },
  ru: {
    translation: {
      dashboard: "Панель", services: "Услуги", addFunds: "Пополнить", orderHistory: "История заказов",
      howToUse: "Как использовать", apiPortal: "API Портал", feedback: "Отзывы", settings: "Настройки",
      support: "Поддержка", loyaltyTier: "Уровень лояльности", aboutUs: "О нас", adminPanel: "Админ",
      logout: "Выйти", telegram: "Telegram", balance: "Баланс", welcome: "С возвращением",
      newOrder: "Новый заказ", wallet: "Кошелёк", completed: "Выполнено", tier: "Уровень",
      needHelp: "Нужна помощь? Свяжитесь с нами", placeOrder: "Заказать", totalCost: "Итого",
      notifications: "Уведомления", noNotifications: "Нет уведомлений", markAllRead: "Прочитать все",
      darkMode: "Тёмная тема", lightMode: "Светлая тема", language: "Язык",
    },
  },
  tr: {
    translation: {
      dashboard: "Panel", services: "Hizmetler", addFunds: "Bakiye Yükle", orderHistory: "Sipariş Geçmişi",
      howToUse: "Nasıl Kullanılır", apiPortal: "API Portalı", feedback: "Geri Bildirim", settings: "Ayarlar",
      support: "Destek", loyaltyTier: "Sadakat Seviyesi", aboutUs: "Hakkımızda", adminPanel: "Yönetici",
      logout: "Çıkış", telegram: "Telegram", balance: "Bakiye", welcome: "Tekrar hoş geldiniz",
      newOrder: "Yeni Sipariş", wallet: "Cüzdan", completed: "Tamamlandı", tier: "Seviye",
      needHelp: "Yardıma mı ihtiyacınız var?", placeOrder: "Sipariş Ver", totalCost: "Toplam",
      notifications: "Bildirimler", noNotifications: "Bildirim yok", markAllRead: "Tümünü okundu",
      darkMode: "Karanlık Mod", lightMode: "Aydınlık Mod", language: "Dil",
    },
  },
  it: {
    translation: {
      dashboard: "Pannello", services: "Servizi", addFunds: "Aggiungi Fondi", orderHistory: "Cronologia Ordini",
      howToUse: "Come Usare", apiPortal: "Portale API", feedback: "Recensioni", settings: "Impostazioni",
      support: "Assistenza", loyaltyTier: "Livello Fedeltà", aboutUs: "Chi Siamo", adminPanel: "Admin",
      logout: "Esci", telegram: "Telegram", balance: "Saldo", welcome: "Bentornato",
      newOrder: "Nuovo Ordine", wallet: "Portafoglio", completed: "Completato", tier: "Livello",
      needHelp: "Hai bisogno di aiuto?", placeOrder: "Ordina", totalCost: "Costo Totale",
      notifications: "Notifiche", noNotifications: "Nessuna notifica", markAllRead: "Segna tutto letto",
      darkMode: "Modalità scura", lightMode: "Modalità chiara", language: "Lingua",
    },
  },
  nl: {
    translation: {
      dashboard: "Dashboard", services: "Diensten", addFunds: "Saldo Opladen", orderHistory: "Bestelgeschiedenis",
      howToUse: "Handleiding", apiPortal: "API Portaal", feedback: "Feedback", settings: "Instellingen",
      support: "Ondersteuning", loyaltyTier: "Loyaliteitsniveau", aboutUs: "Over Ons", adminPanel: "Admin",
      logout: "Uitloggen", telegram: "Telegram", balance: "Saldo", welcome: "Welkom terug",
      newOrder: "Nieuwe Bestelling", wallet: "Portemonnee", completed: "Voltooid", tier: "Niveau",
      needHelp: "Hulp nodig?", placeOrder: "Bestellen", totalCost: "Totale Kosten",
      notifications: "Meldingen", noNotifications: "Geen meldingen", markAllRead: "Alles gelezen",
      darkMode: "Donkere modus", lightMode: "Lichte modus", language: "Taal",
    },
  },
  pl: {
    translation: {
      dashboard: "Panel", services: "Usługi", addFunds: "Doładuj", orderHistory: "Historia Zamówień",
      howToUse: "Jak Używać", apiPortal: "Portal API", feedback: "Opinie", settings: "Ustawienia",
      support: "Wsparcie", loyaltyTier: "Poziom Lojalności", aboutUs: "O Nas", adminPanel: "Admin",
      logout: "Wyloguj", telegram: "Telegram", balance: "Saldo", welcome: "Witaj ponownie",
      newOrder: "Nowe Zamówienie", wallet: "Portfel", completed: "Zakończone", tier: "Poziom",
      needHelp: "Potrzebujesz pomocy?", placeOrder: "Zamów", totalCost: "Koszt Całkowity",
      notifications: "Powiadomienia", noNotifications: "Brak powiadomień", markAllRead: "Oznacz przeczytane",
      darkMode: "Tryb ciemny", lightMode: "Tryb jasny", language: "Język",
    },
  },
  th: {
    translation: {
      dashboard: "แดชบอร์ด", services: "บริการ", addFunds: "เติมเงิน", orderHistory: "ประวัติการสั่ง",
      howToUse: "วิธีใช้", apiPortal: "พอร์ทัล API", feedback: "ความคิดเห็น", settings: "การตั้งค่า",
      support: "ช่วยเหลือ", loyaltyTier: "ระดับสมาชิก", aboutUs: "เกี่ยวกับเรา", adminPanel: "แอดมิน",
      logout: "ออกจากระบบ", telegram: "Telegram", balance: "ยอดเงิน", welcome: "ยินดีต้อนรับกลับ",
      newOrder: "สั่งซื้อใหม่", wallet: "กระเป๋าเงิน", completed: "เสร็จสิ้น", tier: "ระดับ",
      needHelp: "ต้องการความช่วยเหลือ?", placeOrder: "สั่งซื้อ", totalCost: "ราคารวม",
      notifications: "การแจ้งเตือน", noNotifications: "ไม่มีการแจ้งเตือน", markAllRead: "อ่านทั้งหมด",
      darkMode: "โหมดมืด", lightMode: "โหมดสว่าง", language: "ภาษา",
    },
  },
  vi: {
    translation: {
      dashboard: "Bảng điều khiển", services: "Dịch vụ", addFunds: "Nạp tiền", orderHistory: "Lịch sử đơn",
      howToUse: "Hướng dẫn", apiPortal: "Cổng API", feedback: "Phản hồi", settings: "Cài đặt",
      support: "Hỗ trợ", loyaltyTier: "Cấp độ", aboutUs: "Về chúng tôi", adminPanel: "Quản trị",
      logout: "Đăng xuất", telegram: "Telegram", balance: "Số dư", welcome: "Chào mừng trở lại",
      newOrder: "Đơn mới", wallet: "Ví", completed: "Hoàn thành", tier: "Cấp",
      needHelp: "Cần giúp đỡ?", placeOrder: "Đặt hàng", totalCost: "Tổng chi phí",
      notifications: "Thông báo", noNotifications: "Chưa có thông báo", markAllRead: "Đánh dấu đã đọc",
      darkMode: "Chế độ tối", lightMode: "Chế độ sáng", language: "Ngôn ngữ",
    },
  },
  id: {
    translation: {
      dashboard: "Dasbor", services: "Layanan", addFunds: "Isi Saldo", orderHistory: "Riwayat Pesanan",
      howToUse: "Cara Pakai", apiPortal: "Portal API", feedback: "Ulasan", settings: "Pengaturan",
      support: "Bantuan", loyaltyTier: "Level Loyalitas", aboutUs: "Tentang Kami", adminPanel: "Admin",
      logout: "Keluar", telegram: "Telegram", balance: "Saldo", welcome: "Selamat datang kembali",
      newOrder: "Pesanan Baru", wallet: "Dompet", completed: "Selesai", tier: "Level",
      needHelp: "Butuh bantuan?", placeOrder: "Pesan", totalCost: "Total Biaya",
      notifications: "Notifikasi", noNotifications: "Belum ada notifikasi", markAllRead: "Tandai semua dibaca",
      darkMode: "Mode Gelap", lightMode: "Mode Terang", language: "Bahasa",
    },
  },
  uk: {
    translation: {
      dashboard: "Панель", services: "Послуги", addFunds: "Поповнити", orderHistory: "Історія замовлень",
      howToUse: "Як користуватись", apiPortal: "API Портал", feedback: "Відгуки", settings: "Налаштування",
      support: "Підтримка", loyaltyTier: "Рівень лояльності", aboutUs: "Про нас", adminPanel: "Адмін",
      logout: "Вийти", telegram: "Telegram", balance: "Баланс", welcome: "З поверненням",
      newOrder: "Нове замовлення", wallet: "Гаманець", completed: "Виконано", tier: "Рівень",
      needHelp: "Потрібна допомога?", placeOrder: "Замовити", totalCost: "Загальна вартість",
      notifications: "Сповіщення", noNotifications: "Немає сповіщень", markAllRead: "Прочитати все",
      darkMode: "Темна тема", lightMode: "Світла тема", language: "Мова",
    },
  },
  bn: {
    translation: {
      dashboard: "ড্যাশবোর্ড", services: "সেবা", addFunds: "ফান্ড যোগ করুন", orderHistory: "অর্ডার ইতিহাস",
      howToUse: "কিভাবে ব্যবহার করবেন", apiPortal: "API পোর্টাল", feedback: "মতামত", settings: "সেটিংস",
      support: "সাপোর্ট", loyaltyTier: "আনুগত্য স্তর", aboutUs: "আমাদের সম্পর্কে", adminPanel: "অ্যাডমিন",
      logout: "লগআউট", telegram: "টেলিগ্রাম", balance: "ব্যালেন্স", welcome: "স্বাগতম",
      newOrder: "নতুন অর্ডার", wallet: "ওয়ালেট", completed: "সম্পন্ন", tier: "স্তর",
      needHelp: "সাহায্য দরকার?", placeOrder: "অর্ডার দিন", totalCost: "মোট খরচ",
      notifications: "বিজ্ঞপ্তি", noNotifications: "কোনো বিজ্ঞপ্তি নেই", markAllRead: "সব পঠিত",
      darkMode: "ডার্ক মোড", lightMode: "লাইট মোড", language: "ভাষা",
    },
  },
};

const languageNames: Record<string, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", pt: "Português",
  ar: "العربية", hi: "हिन्दी", zh: "中文", ja: "日本語", ko: "한국어",
  ru: "Русский", tr: "Türkçe", it: "Italiano", nl: "Nederlands", pl: "Polski",
  th: "ไทย", vi: "Tiếng Việt", id: "Bahasa Indonesia", uk: "Українська", bn: "বাংলা",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export { languageNames };
export default i18n;
