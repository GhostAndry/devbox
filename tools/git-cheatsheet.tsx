"use client";

import { useState } from "react";

const GIT_COMMANDS: { category: string; commands: { cmd: string; desc: string }[] }[] = [
  { category: "Setup", commands: [
    { cmd: "git init", desc: "Initialize a new repository" },
    { cmd: "git clone <url>", desc: "Clone a remote repository" },
    { cmd: "git config user.name <name>", desc: "Set username" },
    { cmd: "git config user.email <email>", desc: "Set email" },
    { cmd: "git config --list", desc: "List all config" },
  ]},
  { category: "Basic", commands: [
    { cmd: "git status", desc: "Show working tree status" },
    { cmd: "git add .", desc: "Stage all changes" },
    { cmd: "git add <file>", desc: "Stage specific file" },
    { cmd: "git add -p", desc: "Stage changes interactively" },
    { cmd: "git commit -m <msg>", desc: "Commit staged changes" },
    { cmd: "git commit --amend", desc: "Amend last commit" },
    { cmd: "git diff", desc: "Show unstaged changes" },
    { cmd: "git diff --staged", desc: "Show staged changes" },
  ]},
  { category: "Branching", commands: [
    { cmd: "git branch", desc: "List branches" },
    { cmd: "git branch <name>", desc: "Create a new branch" },
    { cmd: "git checkout <branch>", desc: "Switch to a branch" },
    { cmd: "git checkout -b <name>", desc: "Create and switch to branch" },
    { cmd: "git switch <branch>", desc: "Switch branch (modern)" },
    { cmd: "git switch -c <name>", desc: "Create and switch (modern)" },
    { cmd: "git merge <branch>", desc: "Merge branch into current" },
    { cmd: "git rebase <branch>", desc: "Rebase onto branch" },
    { cmd: "git branch -d <name>", desc: "Delete a branch" },
    { cmd: "git branch -D <name>", desc: "Force delete a branch" },
  ]},
  { category: "Remote", commands: [
    { cmd: "git remote -v", desc: "List remote repositories" },
    { cmd: "git remote add <name> <url>", desc: "Add a remote" },
    { cmd: "git push origin <branch>", desc: "Push to remote" },
    { cmd: "git push -u origin <branch>", desc: "Push and set upstream" },
    { cmd: "git pull origin <branch>", desc: "Pull from remote" },
    { cmd: "git fetch", desc: "Download remote changes" },
    { cmd: "git fetch --prune", desc: "Fetch and remove stale refs" },
  ]},
  { category: "Undo", commands: [
    { cmd: "git reset HEAD <file>", desc: "Unstage a file" },
    { cmd: "git checkout -- <file>", desc: "Discard changes in file" },
    { cmd: "git restore <file>", desc: "Restore file (modern)" },
    { cmd: "git restore --staged <file>", desc: "Unstage (modern)" },
    { cmd: "git reset --soft HEAD~1", desc: "Undo last commit, keep changes" },
    { cmd: "git reset --hard HEAD~1", desc: "Undo last commit, discard changes" },
    { cmd: "git stash", desc: "Stash current changes" },
    { cmd: "git stash pop", desc: "Apply stashed changes" },
    { cmd: "git stash list", desc: "List stashes" },
    { cmd: "git revert <commit>", desc: "Revert a commit safely" },
  ]},
  { category: "Log & History", commands: [
    { cmd: "git log", desc: "Show commit history" },
    { cmd: "git log --oneline", desc: "Compact commit history" },
    { cmd: "git log --graph --oneline", desc: "Graphical branch history" },
    { cmd: "git log -p", desc: "Show commits with diffs" },
    { cmd: "git show <commit>", desc: "Show commit details" },
    { cmd: "git blame <file>", desc: "Show who changed each line" },
    { cmd: "git reflog", desc: "Show reference log" },
  ]},
  { category: "Tags", commands: [
    { cmd: "git tag", desc: "List tags" },
    { cmd: "git tag <name>", desc: "Create a lightweight tag" },
    { cmd: "git tag -a <name> -m <msg>", desc: "Create an annotated tag" },
    { cmd: "git push origin <tag>", desc: "Push a tag" },
    { cmd: "git push --tags", desc: "Push all tags" },
  ]},
];

export default function GitCheatsheet() {
  const [search, setSearch] = useState("");

  const filtered = GIT_COMMANDS.map(({ category, commands }) => ({
    category,
    commands: commands.filter(({ cmd, desc }) =>
      `${cmd} ${desc}`.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.commands.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search commands..."
        className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground"
      />

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No commands found.</p>
      )}

      {filtered.map(({ category, commands }) => (
        <div key={category}>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{category}</h3>
          <div className="flex flex-col gap-2">
            {commands.map(({ cmd, desc }) => (
              <div key={cmd} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <code className="font-mono text-sm">{cmd}</code>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(cmd)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}