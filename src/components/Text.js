/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect, useMemo, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { useSpeech } from "react-text-to-speech";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import parse from "html-react-parser";
import { toast } from "react-toastify";

export default function Text({ id, text }) {
  const [markdown, setMarkdown] = useState("");
  const memoizedText = useMemo(
    () => (
      <div className="markdown">
        {markdown ? (
          parse(markdown)
        ) : (
          <Markdown className={`markdown-${id}`} remarkPlugins={[remarkGfm]}>
            {text}
          </Markdown>
        )}
      </div>
    ),
    [text, markdown],
  );
  const { Text, speechStatus, start, stop } = useSpeech({
    text: memoizedText,
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
    <div className="flex flex-col items-center space-y-3 px-4 text-justify sm:px-5 md:px-6">
      <div className="flex w-[80vw] max-w-60 justify-around">
        <span className="text-lg font-medium">Text</span>
        <div className="flex items-center space-x-2">
          <button>
            <FaCopy onClick={copy} />
          </button>
          <button className="scale-125">{speechStatus === "started" ? <HiVolumeOff onClick={stop} /> : <HiVolumeUp onClick={start} />}</button>
        </div>
      </div>
      <div className="max-w-full overflow-x-scroll whitespace-pre-line">
        <Text />
      </div>
    </div>
  );
}
