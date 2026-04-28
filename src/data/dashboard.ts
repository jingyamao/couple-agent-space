import {
  CalendarDays,
  Camera,
  CheckCircle2,
  HeartHandshake,
  MessageCircleHeart,
  Sparkles,
  SunMedium
} from "lucide-react";

export const coupleSnapshot = {
  title: "我们的空间",
  daysTogether: 642,
  city: "上海",
  nextAnniversary: "在一起纪念日",
  nextAnniversaryInDays: 18,
  wishProgress: 68
};

export const moodCards = [
  {
    name: "我",
    mood: "需要一点鼓励",
    energy: "中等",
    care: "今晚想散步 20 分钟",
    tone: "rose"
  },
  {
    name: "对方",
    mood: "工作有点满",
    energy: "偏低",
    care: "适合少问多陪伴",
    tone: "teal"
  }
] as const;

export const quickActions = [
  {
    title: "写共同日记",
    description: "把今天的小事存下来",
    icon: MessageCircleHeart,
    tone: "rose"
  },
  {
    title: "记录心情",
    description: "3 秒告诉对方状态",
    icon: SunMedium,
    tone: "gold"
  },
  {
    title: "添加纪念日",
    description: "自动倒计时和提醒",
    icon: CalendarDays,
    tone: "teal"
  },
  {
    title: "加入愿望",
    description: "一起规划下一件事",
    icon: Sparkles,
    tone: "rose"
  }
] as const;

export const timeline = [
  {
    title: "周六约会方案",
    meta: "AI 已生成 3 个轻量路线",
    icon: HeartHandshake
  },
  {
    title: "火锅日记待确认",
    meta: "共同日记草稿",
    icon: CheckCircle2
  },
  {
    title: "春天相册",
    meta: "12 张照片待归档",
    icon: Camera
  }
] as const;

export const wishList = [
  { title: "去镰仓看海", category: "旅行", progress: 35 },
  { title: "做一本年度相册", category: "回忆", progress: 72 },
  { title: "每月一次认真约会", category: "习惯", progress: 84 }
] as const;
