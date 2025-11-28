@echo off
echo 正在重置 HarmonyOS 项目...

echo 1. 清理缓存目录...
if exist .hvigor rmdir /s /q .hvigor
if exist oh_modules rmdir /s /q oh_modules
if exist entry\build rmdir /s /q entry\build
if exist AppScope\build rmdir /s /q AppScope\build
if exist entry\.preview rmdir /s /q entry\.preview

echo 2. 重新创建缓存目录...
mkdir .hvigor
mkdir .hvigor\cache
mkdir .hvigor\dependencyMap
mkdir .hvigor\outputs
mkdir .hvigor\report

echo 3. 清理完成！
echo 请在 DevEco Studio 中：
echo - 点击 File -^> Invalidate Caches / Restart...
echo - 选择 "Invalidate and Restart"
echo - 重新构建项目

pause