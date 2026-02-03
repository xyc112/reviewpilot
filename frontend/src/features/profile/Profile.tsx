import { useState, useEffect, useRef, useCallback } from "react";
import { User as UserIcon, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { LoadingSpinner, useToast } from "@/shared/components";
import { profileAPI } from "@/shared/api";
import type { UserProfile } from "@/shared/types";
import { getErrorMessage } from "@/shared/utils";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError } = useToast();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileAPI.getProfile();
      const data = res.data;
      setProfile(data);
      setNickname(data.nickname ?? "");
      setBio(data.bio ?? "");
      if (data.hasAvatar) {
        const url = await profileAPI.getAvatarUrl();
        if (url) {
          setAvatarUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      }
    } catch {
      showError("加载个人信息失败");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadProfile();
    return () => {
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [loadProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await profileAPI.updateProfile({ nickname, bio });
      setProfile(res.data);
      success("保存成功");
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      await profileAPI.uploadAvatar(file);
      success("头像上传成功");
      const url = await profileAPI.getAvatarUrl();
      if (url) {
        setAvatarUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
      if (profile) setProfile({ ...profile, hasAvatar: true });
      window.dispatchEvent(new CustomEvent("avatar-updated"));
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-muted-foreground">无法加载个人信息</div>;
  }

  const displayName = profile.nickname?.trim() ?? profile.username;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto w-full max-w-[1000px] px-4">
        <h1 className="mb-5 shrink-0 text-2xl font-bold text-foreground">
          个人信息
        </h1>
        <Card className="shrink-0 overflow-hidden rounded-xl border border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/30 py-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={() => {
                  handleAvatarClick();
                }}
                disabled={uploading}
                className="relative rounded-full ring-2 ring-primary/20 transition hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Avatar className="size-24 border-4 border-background shadow-lg">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/15 text-primary text-3xl">
                    <UserIcon className="size-12" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Camera className="size-4" />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => {
                  void handleAvatarChange(e);
                }}
                aria-label="上传头像"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">用户名</p>
                <p className="text-lg font-semibold text-foreground">
                  {profile.username}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  点击头像上传新照片，支持 JPEG/PNG/GIF/WebP，最大 2MB
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-5 sm:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                  }}
                  placeholder="选填，用于展示"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                  }}
                  placeholder="选填"
                  rows={4}
                  className="resize-none rounded-xl"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <Save className="mr-2 size-4" />
                  {saving ? "保存中…" : "保存"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
