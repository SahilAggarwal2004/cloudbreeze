import { useEffect, useState } from "react";
import Text from "../components/Text";
import { fetchResource } from "./functions";

export const markdownRenderer = {
  name: "markdown",
  canRender: ({ mimeType }) => mimeType === "text/markdown",
  Component({ src, onLoad, onError }) {
    const [data, setData] = useState("");

    useEffect(() => {
      const controller = new AbortController();

      fetchResource(src, "text", controller.signal)
        .then((data) => {
          setData(data);
          onLoad();
        })
        .catch(onError);

      return () => controller.abort();
    }, [src]);

    return <Text value={data} preview className="markdown-renderer" />;
  },
};
