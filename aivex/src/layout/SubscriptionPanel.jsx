import { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  MessageCircle,
  Eye,
  Palette,
  Infinity,
  Users,
  UserCheck,
  Star,
  Headphones,
  Zap,
  Rocket,
  FileEdit,
  Monitor,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "₽",
    sub: "",
    icon: null,
    features: [
      { text: "Доступ к профилям Quick и Detailed", icon: UserCheck },
      { text: "Лимит 50 сообщений в день", icon: MessageCircle },
      { text: "Стандартная модель AI", icon: Sparkles },
      { text: "Базовые темы: Midnight, AMOLED, Slime", icon: Palette },
    ],
    accent: "border-white/[0.10]",
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "499",
    oldPrice: "1 000",
    period: "₽",
    sub: "/мес",
    icon: Sparkles,
    features: [
      { text: "Неограниченное количество сообщений", icon: Infinity },
      { text: "GPT-4o с поддержкой Vision", icon: Eye },
      { text: "Аудиозапись рабочего стола", icon: Headphones },
      { text: "Полный доступ ко всем профилям", icon: Users },
      { text: "Все темы, кастомизация и создание своих", icon: Palette },
    ],
    accent: "border-emerald-500/40",
    badge: "Лучший выбор",
  },
  {
    id: "premium",
    name: "Premium",
    price: "999",
    oldPrice: "2 500",
    period: "₽",
    sub: "/мес",
    icon: Crown,
    features: [
      { text: "Полный доступ ко всем возможностям", icon: Star },
      { text: "Приоритетная поддержка пользователей", icon: Headphones },
      { text: "Приоритетная обработка запросов", icon: Zap },
      { text: "Ранний доступ к новым функциям", icon: Rocket },
      { text: "Создание собственных профилей с промптами", icon: FileEdit },
      { text: "Свой промпт для Screen Peek", icon: Monitor },
    ],
    accent: "border-amber-500/35",
    badge: null,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const TIER_RANK = { free: 0, pro: 1, premium: 2 };

const SubscriptionPanel = forwardRef(function SubscriptionPanel(
  { open, onClose, currentTier },
  ref,
) {
  const currentRank = TIER_RANK[currentTier] ?? 0;
  const scrollRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [buyingTier, setBuyingTier] = useState(null);
  const { panelAccentStyle, uiSettings } = useSettings();

  const handleBuy = useCallback(async (tierId) => {
    if (buyingTier) return;
    setBuyingTier(tierId);
    try {
      const result = await window.aivexWindow?.createPayment(tierId);
      if (result?.url) {
        window.aivexWindow?.openExternal(result.url);
      } else if (result?.error) {
        alert("Ошибка: " + result.error);
      }
    } catch {
      alert("Не удалось создать сессию оплаты");
    } finally {
      setBuyingTier(null);
    }
  }, [buyingTier]);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(updateScroll);
  }, [open, updateScroll]);

  const setRefs = useCallback(
    (el) => {
      scrollRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-[96px] right-5 w-[380px] z-50 rounded-3xl border backdrop-blur-2xl"
          style={panelAccentStyle}
        >
          <div className="relative">
            <motion.div
              ref={setRefs}
              className="max-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide p-5"
              onScroll={updateScroll}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-medium text-white/70 tracking-wide">Подписка</h2>
                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition"
                >
                  ✕
                </button>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const isCurrent = tier.id === currentTier;
                  const isBelow = TIER_RANK[tier.id] < currentRank;

                  return (
                    <motion.div
                      key={tier.id}
                      variants={cardVariants}
                      className={`relative rounded-2xl border p-4 transition-all duration-300 backdrop-blur-xl ${isBelow ? "border-white/[0.04]" : tier.accent} ${isCurrent ? "bg-white/[0.08]" : isBelow ? "bg-black/[0.18]" : "bg-white/[0.03] hover:bg-white/[0.05] hover:-translate-y-0.5"}`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-2 right-4 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xl">
                          {tier.badge}
                        </span>
                      )}
                      <div className={`flex items-start justify-between mb-3 ${isBelow ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-2.5">
                          {Icon && (
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                              <Icon size={15} className={isBelow ? "text-white/30" : "text-amber-400/80"} />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isBelow ? "text-white/40" : "text-white/80"}`}>{tier.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.10] text-white/60 border border-white/[0.08]">
                                Стоит у вас
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right leading-none">
                          {tier.oldPrice && (
                            <span className={`block text-[11px] line-through ${isBelow ? "text-white/15" : "text-white/25"}`}>{tier.oldPrice} ₽</span>
                          )}
                          <span className={`text-lg font-bold tracking-tight ${isBelow ? "text-white/40" : "text-white"}`}>{tier.price}</span>
                          <span className={`text-sm font-medium ml-0.5 ${isBelow ? "text-white/25" : "text-white/50"}`}>{tier.period}</span>
                          {tier.sub && (
                            <span className={`block text-[10px] mt-0.5 ${isBelow ? "text-white/15" : "text-white/30"}`}>{tier.sub}</span>
                          )}
                        </div>
                      </div>

                      <ul className={`space-y-2 ${isBelow ? "opacity-50" : ""}`}>
                        {tier.features.map((f) => {
                          const FeatIcon = f.icon;
                          return (
                            <li key={f.text} className="flex items-start gap-2.5">
                              <FeatIcon
                                size={12}
                                className="mt-0.5 shrink-0 text-white/30"
                              />
                              <span className="text-[12px] text-white/50 leading-relaxed">
                                {f.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {tier.id !== "free" && (
                        <button
                          onClick={() => handleBuy(tier.id)}
                          disabled={isCurrent || buyingTier !== null || isBelow}
                          className={`mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                            isCurrent
                              ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                              : isBelow
                                ? "bg-black/[0.15] text-white/25 cursor-not-allowed"
                                : buyingTier === tier.id
                                  ? "bg-white/[0.06] text-white/50"
                                  : "bg-white/[0.08] hover:bg-white/[0.12] text-white/70 hover:text-white"
                          }`}
                        >
                          {buyingTier === tier.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 size={12} className="animate-spin" />
                              Обработка...
                            </span>
                          ) : isCurrent ? (
                            "Уже активно"
                          ) : isBelow ? (
                            "Приобретите выше"
                          ) : (
                            "Оформить"
                          )}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {canScrollUp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-0 left-0 right-0 h-10 flex items-start justify-center pointer-events-none rounded-t-3xl overflow-hidden"
                  style={{ background: `linear-gradient(to bottom, ${uiSettings.panelColor}F2 50%, transparent)` }}
                >
                  <div className="mt-1 animate-bounce-arrow-up">
                    <ChevronDown size={13} className="text-white/25 rotate-180" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {canScrollDown && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-0 left-0 right-0 h-10 flex items-start justify-center pointer-events-none rounded-b-3xl overflow-hidden"
                  style={{ background: `linear-gradient(to top, ${uiSettings.panelColor}F2 50%, transparent)` }}
                >
                  <div className="mt-5 animate-bounce-arrow-down">
                    <ChevronDown size={13} className="text-white/25" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SubscriptionPanel;
