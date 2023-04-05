import { ActionPanel, List, Action } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";

export default function Command() {
  const state = useFetch();

  return (
    <List isLoading={state.isLoading} isShowingDetail>
      {state.results.map((result) => (
        <List.Item
          key={result.url}
          title={result.url}
          detail={imagePreview(result.url)}
          icon={result.url}
          actions={
            <ActionPanel>
              {pasteActionMarkdown(result.url)}
              {pasteAction(result.url)}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function imagePreview(url: string) {
  return <List.Item.Detail markdown={`![LGTM](${url})`} />;
}

function pasteActionMarkdown(url: string) {
  return <Action.Paste content={`![LGTM](${url})`} shortcut={{ modifiers: ["cmd"], key: "c" }} />;
}

function pasteAction(url: string) {
  return <Action.Paste content={`${url}`} shortcut={{ modifiers: ["cmd"], key: "enter" }} />;
}

function useFetch() {
  const [state, setState] = useState<ImageState>({ results: [], isLoading: true });
  const cancelRef = useRef<AbortController | null>(null);
  cancelRef.current?.abort();
  cancelRef.current = new AbortController();

  useEffect(() => {
    if (!cancelRef.current) return;
    fetchImages(cancelRef.current.signal);
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  async function fetchImages(signal: AbortSignal) {
    const response = await fetch("https://lgtmoon.herokuapp.com/api/images/random", { method: "get", signal: signal });
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    type Json = Record<string, unknown>;
    const json = (await response.json()) as Json;
    const images = json.images as Image[];

    setState((oldState) => ({
      ...oldState,
      results: images,
      isLoading: false,
    }));
    return state;
  }
  return state;
}

interface ImageState {
  results: Image[];
  isLoading: boolean;
}
interface Image {
  url: string;
  isConverted: boolean;
}
