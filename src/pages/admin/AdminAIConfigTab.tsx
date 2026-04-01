import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import apiClient from "../../libs/api";
import toast from "react-hot-toast";

function AdminAIConfigTab() {
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [waitingRoom, setWaitingRoom] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/admins/ai-config")
      .then((res: any) => {
        setModel(res.openai_model || "");
        setPrompt(res.system_prompt_override || "");
        setWaitingRoom(res.waiting_room_enabled !== false);
      })
      .catch(() => {});
  }, []);

  const save = () => {
    apiClient
      .put("/api/admins/ai-config", {
        openai_model: model,
        system_prompt_override: prompt,
        waiting_room_enabled: waitingRoom,
      })
      .then(() => toast.success("AI settings saved"))
      .catch(() => toast.error("Save failed"));
  };

  return (
    <div className="grow flex flex-col gap-y-4 max-w-xl">
      <p className="font-semibold text-xl leading-6">AI configuration</p>
      <p className="text-sm text-disabled-text">
        Default OpenAI model name and optional system prompt override for session summaries. Set{" "}
        <code className="text-xs bg-light-background px-1 rounded">OPENAI_API_KEY</code> on the server
        for live analysis.
      </p>
      <label className="text-sm font-medium">OpenAI model</label>
      <Input
        name="model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full"
        placeholder="gpt-4o-mini"
      />
      <label className="text-sm font-medium">System prompt override (optional)</label>
      <textarea
        className="w-full min-h-[120px] rounded-xl border border-primary-border/25 p-3 text-sm"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Leave empty to use built-in child-care prompt"
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={waitingRoom}
          onChange={(e) => setWaitingRoom(e.target.checked)}
        />
        Waiting room enabled (host must admit patient/guest)
      </label>
      <Button color="primary" onClick={save} className="w-fit">
        Save
      </Button>
    </div>
  );
}

export default AdminAIConfigTab;
