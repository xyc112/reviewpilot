import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { courseAPI } from "../services";
import { useAuthStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const CreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    level: "BEGINNER",
  });

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const courseData = {
        title: form.title,
        description: form.description || "",
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        level: form.level,
      };

      await courseAPI.createCourse(courseData);
      success("课程创建成功");
      void navigate("/courses");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "创建课程失败";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>无权限访问此页面</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-4">
      <Card className="rounded-xl shadow-sm">
        <CardContent className="pt-6">
          <h1 className="mb-6 text-2xl font-semibold">创建新课程</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">课程标题</Label>
              <Input
                id="title"
                placeholder="请输入课程标题"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                }}
                maxLength={100}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">课程描述</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="请输入课程描述"
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                }}
                maxLength={500}
                className="resize-none"
              />
              <span className="text-xs text-muted-foreground">
                {form.description.length}/500
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                placeholder="例如: 数学, 基础, 入门"
                value={form.tags}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, tags: e.target.value }));
                }}
              />
              <span className="text-xs text-muted-foreground">
                多个标签请用逗号分隔
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label>难度等级</Label>
              <Select
                value={form.level}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, level: value }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择难度等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">初级</SelectItem>
                  <SelectItem value="INTERMEDIATE">中级</SelectItem>
                  <SelectItem value="ADVANCED">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <Alert variant="destructive" className="mb-2">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            ) : null}

            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate(-1)}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "创建中..." : "创建课程"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
