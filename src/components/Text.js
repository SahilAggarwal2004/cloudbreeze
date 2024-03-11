/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import Speech, { HighlightedText } from "react-text-to-speech";
import { Balancer } from "react-wrap-balancer";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import parse from "html-react-parser";
import { toast } from "react-toastify";

export default function Text({ id, text }) {
  const [markdown, setMarkdown] = useState("");

  const mdText = (
    <div className="markdown">
      {markdown ? (
        parse(markdown)
      ) : (
        <Markdown className={`markdown-${id}`} remarkPlugins={[remarkGfm]}>
          {text}
        </Markdown>
      )}
    </div>
  );

  useLayoutEffect(() => {
    setMarkdown("");
  }, [text]);

  useLayoutEffect(() => {
    if (!markdown) setMarkdown(document.querySelector(`.markdown-${id}`)?.innerHTML || "");
  }, [markdown]);

  function copy() {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!");
  }

  return (
    <div className="flex flex-col items-center px-4 text-justify space-y-2.5">
      <div className="flex justify-around w-[80vw] max-w-60">
        <span className="text-lg font-medium">Text</span>
        <div className="flex items-center space-x-2">
          <FaCopy className="cursor-pointer" onClick={copy} />
          <Speech id={id} text={mdText} useStopOverPause highlightText />
        </div>
      </div>
      <div className="whitespace-pre-line max-w-full overflow-x-scroll" style={{ wordBreak: "break-word" }}>
        <Balancer>
          <HighlightedText id={id}>{mdText}</HighlightedText>
        </Balancer>
      </div>
    </div>
  );
}
