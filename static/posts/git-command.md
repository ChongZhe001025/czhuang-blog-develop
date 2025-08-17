# Git Push 流程指南

## 1. 初始化 Git 倉庫 (如果尚未初始化)
```sh
git init
```

## 2. 設定遠端倉庫
如果還沒有遠端倉庫，需要先新增：
```sh
git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git
```

⚠️ 確保遠端網址正確，可用以下指令檢查：
```sh
git remote -v
```

## 3. 檢查目前的分支
查看遠端分支：
```sh
git branch -r
```

如果需要將本地分支名稱調整為 `main`，執行：
```sh
git branch -M main
```

## 4. 添加與提交變更
```sh
git add .
git commit -m "Update blog"
```

## 5. 推送到遠端倉庫

### 第一次推送
```sh
git push -u origin main
```

### 強制推送 (覆蓋遠端)
⚠️ **謹慎使用**，避免覆蓋掉遠端的重要變更。
```sh
git push -f origin main
```

## 6. 完整 Git Push 流程
```sh
git init  # 若未初始化，則執行此步驟
git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git  # 設定遠端
git branch -M main  # 確保當前分支為 main
git add .  # 添加所有變更
git commit -m "Update blog"  # 提交變更
git push -u origin main  # 第一次推送
```

## 7. 確保同步遠端變更
⚠️ 若遠端已有修改，但本地版本較舊，推送前應執行：
```sh
git pull origin main --rebase  # 確保同步遠端變更
git push origin main  # 再次推送
```

這樣的流程可以確保 Git 推送穩定且符合最佳實踐。🚀
