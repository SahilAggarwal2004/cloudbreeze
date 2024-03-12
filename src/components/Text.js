/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { useSpeech } from "react-text-to-speech";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeReact from "rehype-react";
import parse from "html-react-parser";
import { toast } from "react-toastify";

export default function Text({ id, text }) {
  const [markdown, setMarkdown] = useState("");
  const { Text, speechStatus, start, stop } = useSpeech({
    text: (
      <div className="markdown">
        {markdown ? (
          parse(markdown)
        ) : (
          <Markdown className={`markdown-${id}`} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeReact]}>
            {text}
          </Markdown>
        )}
      </div>
    ),
    highlightText: true,
    highlightProps: { style: { backgroundColor: "yellow", color: "black" } },
  });

  useLayoutEffect(() => {
    stop();
    setTimeout(() => setMarkdown(""), 1);
  }, [text]);

  useLayoutEffect(() => {
    if (!markdown) setMarkdown(document.querySelector(`.markdown-${id}`)?.innerHTML || "");
  }, [markdown]);

  function copy() {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!");
  }

  return (
    <div className="flex flex-col items-center px-4 sm:px-5 md:px-6 text-justify space-y-3">
      <div className="flex justify-around w-[80vw] max-w-60">
        <span className="text-lg font-medium">Text</span>
        <div className="flex items-center space-x-2">
          <button>
            <FaCopy onClick={copy} />
          </button>
          <button className="scale-125">{speechStatus === "started" ? <HiVolumeOff onClick={stop} /> : <HiVolumeUp onClick={start} />}</button>
        </div>
      </div>
      <div className="whitespace-pre-line max-w-full overflow-x-scroll" style={{ wordBreak: "break-word" }}>
        <Text />
      </div>
    </div>
  );
}
