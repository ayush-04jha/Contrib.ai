import { useEffect, useState } from "react";
import API from "../../axiosSetup/API";

type RepoIssue = {
  id: number;
  title: string;
  number: number;
  labels: string[];
  status: "open" | "closed";
  updatedAt: string;
};




///
function IssuePanel({ jobid }: { jobid: string | undefined }) {
  const [activeLabel, setActiveLabel] = useState("All");
  const [repoIssues, setRepoIssues] = useState<RepoIssue[]>([]);
  const filteredIssues =
    activeLabel === "All"
      ? repoIssues
      : repoIssues.filter((issue) => issue.labels.includes(activeLabel));

  const issueLabels = Array.from(
    new Set(repoIssues.flatMap((issue) => issue.labels))
  );
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        console.log("is rerendering?");
        
        const res = await API.get(`/issues/${jobid}`);
        const formattedIssues: RepoIssue[] = res.data.map(
          (issue: {
            id: number;
            title: string;
            number: number;
            state: "open" | "closed";
            updated_at: string;
            labels: { name: string }[];
          }) => ({
            id: issue.id,
            title: issue.title,
            number: issue.number,
            labels: issue.labels.map(label => label.name),
            status: issue.state,
            updatedAt: new Date(issue.updated_at).toLocaleString(),
          })
        );
        console.log("formated issues:",formattedIssues);
        
        setRepoIssues(formattedIssues);

      } catch (e) {
        console.log(e);

      }

    }
    if (jobid) {
      fetchIssues();
    }
  }, [])







  return (
    <aside className="flex max-h-screen flex-col border-t border-[#1E2530] bg-[#0d0f14] xl:border-l xl:border-t-0">
      <div className="border-b border-[#1E2530] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-syne-Bold text-[13px] text-white">Repo issues</div>
            <div className="text-[12px] text-[#6b7788]">{filteredIssues.length} matching issues</div>
          </div>
          <div className="rounded-[5px] border border-[#2a3048] bg-[#11141C] px-2 py-1 text-[11px] text-[#828FAC]">
            fix them
          </div>
        </div>
      </div>

      <div className="border-b border-[#1E2530] px-4 py-3">
        <div className="mb-2 text-[11px] uppercase text-[#6b7788]">Labels</div>
        <div className="flex flex-wrap gap-2">
          {["All", ...issueLabels].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveLabel(label)}
              className={`rounded-[5px] border px-2 py-1 text-[11px] transition ${activeLabel === label
                ? "border-[#4c5f92] bg-[#1a2035] text-white"
                : "border-[#1E2530] bg-[#11141C] text-[#828FAC] hover:border-[#2a3048] hover:text-white"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {filteredIssues.map((issue) => (
          <article key={issue.id} className="rounded-[8px] border border-[#1E2530] bg-[#11141C] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-syne-jetBrains text-[11px] text-[#6b7788]">#{issue.number}</span>
              <span className={`rounded-[5px] border px-2 py-0.5 text-[10px] ${issue.status === "open"
                ? "border-[#244f38] bg-[#102018] text-[#7ed9a4]"
                : "border-[#4c3f25] bg-[#211a10] text-[#d7b46a]"
                }`}>
                {issue.status}
              </span>
            </div>
            <h2 className="text-[13px] leading-5 text-white">{issue.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {issue.labels.map((label) => (
                <span key={label} className="rounded-[5px] border border-[#2a3048] bg-[#1a2035] px-2 py-0.5 text-[10px] text-[#AAB5CC]">
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[#6b7788]">Updated {issue.updatedAt}</div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export default IssuePanel;
