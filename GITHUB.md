# GitHub auto-push (Railway deploy)

Remote: https://github.com/munashenm/load-sa.git

## One-time: enable push after every commit

```powershell
cd zim-sa-delivery
.\scripts\install-auto-push-hook.ps1
```

After that, each **`git commit`** automatically runs **`git push`** to GitHub → Railway redeploys.

## Manual push

```powershell
git add .
git commit -m "Your message"
# push runs automatically if hook is installed
```

## Important

- **Saving a file in the editor does not push** — you must **commit** (Cursor Source Control → Commit, or `git commit`).
- First push may ask for GitHub login or a **Personal Access Token** as password.

## Cursor tip

Source Control panel → commit message → **Commit** → hook pushes to `origin/main`.
