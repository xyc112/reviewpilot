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
  { icon: BookOpen, title: "课程", desc: "管理课程与知识关联" },
  { icon: FileText, title: "笔记与测验", desc: "记录与自测" },
  { icon: Calendar, title: "复习计划", desc: "安排复习节奏" },
  { icon: TrendingUp, title: "进度", desc: "追踪学习统计" },
  { icon: GitBranch, title: "知识图谱", desc: "可视化知识点" },
  { icon: MessageCircle, title: "社区", desc: "交流与分享" },
];

const Landing = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-landing-bg">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--landing-border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--landing-border)_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]"
          style={{ opacity: 0.5 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/14%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,var(--chart-2)/8%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,var(--primary)/6%,transparent_50%)]" />
      </div>

      <LandingHeader hideBorder />

      <main className="flex flex-1 flex-col min-h-0">
        <section className="flex shrink-0 flex-col justify-center border-b border-transparent px-4 pt-16 pb-12 md:pt-20 md:pb-14">
          <div className="page-container">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                <span className="text-gradient">让复习更高效</span>
              </h1>
              <p className="text-muted-foreground md:text-lg">
                课程·笔记·测验·图谱，一站搞定
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center py-8 md:py-10">
          <div className="page-container">
            <h2 className="mb-6 text-center text-xl font-bold text-foreground md:text-2xl">
              功能一览
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex flex-col gap-2 rounded-2xl border border-landing-border/80 bg-landing-card/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-landing-card hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="shrink-0 border-t border-landing-border/60 bg-landing-border/20 py-4 backdrop-blur-sm">
          <div className="page-container flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="size-4" aria-hidden />
            <span className="text-sm font-semibold">Nexus</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
