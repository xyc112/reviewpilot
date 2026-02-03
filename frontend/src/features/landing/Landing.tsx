import {
  BookOpen,
  Calendar,
  FileText,
  GitBranch,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { LandingHeader } from "@/shared/components/layout/LandingHeader";

const features = [
  {
    icon: BookOpen,
    title: "课程与知识图谱",
    description: "管理课程，可视化知识关联",
  },
  {
    icon: FileText,
    title: "笔记与测验",
    description: "记录笔记、创建测验",
  },
  {
    icon: Calendar,
    title: "复习计划",
    description: "科学安排复习节奏",
  },
  {
    icon: TrendingUp,
    title: "学习进度",
    description: "实时追踪进度与统计",
  },
  {
    icon: GitBranch,
    title: "知识图谱",
    description: "图谱呈现知识点与关联",
  },
  {
    icon: MessageCircle,
    title: "社区交流",
    description: "与学习者交流与分享",
  },
];

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-landing-bg">
      {/* Cursor-style 背景：网格 + 渐变光晕（米色系） */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--landing-border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--landing-border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.6 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/12%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,var(--chart-2)/8%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,var(--primary)/5%,transparent_50%)]" />
      </div>

      <LandingHeader hideBorder />

      {/* Hero */}
      <section className="border-b border-transparent pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              让复习更高效
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              课程、笔记、测验与知识图谱，一站搞定。
            </p>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 md:py-28">
        <div className="page-container">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              功能一览
            </h2>
            <p className="text-muted-foreground">
              课程、笔记、测验、知识图谱与复习计划
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex flex-col gap-3 rounded-2xl border border-landing-border/80 bg-landing-card/90 p-6 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-landing-card"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="border-t border-landing-border/60 bg-landing-border/30 py-8 backdrop-blur-sm">
        <div className="page-container flex items-center justify-center gap-2 text-muted-foreground">
          <Sparkles className="size-4" aria-hidden />
          <span className="text-sm font-medium">Nexus</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
