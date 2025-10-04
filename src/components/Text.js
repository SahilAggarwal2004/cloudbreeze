import { FaCopy } from "react-icons/fa";
import { TbMarkdown, TbMarkdownOff } from "react-icons/tb";
import { useRemark } from "react-remarkify";
import { useSpeech } from "react-text-to-speech";
import { HiVolumeOff, HiVolumeUp } from "react-text-to-speech/icons";
import { toast } from "react-toastify";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import useStorage from "../hooks/useStorage";

export default function Text({ value }) {
  const [showMarkdown, setShowMarkdown] = useStorage("markdown", false);
  const reactContent = useRemark({ markdown: value, rehypePlugins: [rehypeRaw, rehypeSanitize], remarkPlugins: [remarkGfm], remarkToRehypeOptions: { allowDangerousHtml: true } });
  const { Text, speechStatus, start, stop } = useSpeech({ text: showMarkdown ? reactContent : value, highlightText: true });

  function copy() {
    navigator.clipboard.writeText(value);
    toast.success("Text copied to clipboard!");
  }

  return (
    <div className="flex flex-col items-center space-y-3 px-4 sm:px-5 md:px-6">
      <div className="flex w-[80vw] max-w-60 justify-around">
        <span className="text-lg font-medium">Text</span>
        <div className="flex items-center space-x-3">
          <button title="Copy text" onClick={copy}>
            <FaCopy />
          </button>
          <button className="scale-150" onClick={() => setShowMarkdown((prev) => !prev)}>
            {showMarkdown ? <TbMarkdownOff title="Disable markdown" /> : <TbMarkdown title="Enable markdown" />}
          </button>
          <button>{speechStatus === "started" ? <HiVolumeOff title="Stop speech" onClick={stop} /> : <HiVolumeUp title="Start speech" onClick={start} />}</button>
        </div>
      </div>
      <Text className="prose prose-th:w-screen prose-th:max-w-full prose-th:border prose-td:border prose-th:p-2 prose-td:p-2! prose-ul:whitespace-normal prose-ol:whitespace-normal prose-headings:my-2 prose-pre:my-2 prose-table:my-2 prose-table:block prose-table:overflow-x-auto grid max-w-full grid-cols-1 break-words whitespace-pre-wrap *:my-0 *:w-full *:whitespace-pre-wrap" />
    </div>
  );
}
