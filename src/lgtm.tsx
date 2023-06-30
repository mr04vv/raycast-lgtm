import { ActionPanel, List, Action } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";

export default function Command() {
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
  }

  return (
    <List isLoading={state.isLoading} isShowingDetail>
      <List.Item
        key={"reload"}
        title={"検索結果をリロード  ⌘ R"}
        actions={
          <ActionPanel>
            <Action
              title="Reload result"
              onAction={() => {
                if (cancelRef.current) {
                  fetchImages(cancelRef.current.signal);
                }
              }}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
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
              <Action
                title="Reload result"
                onAction={() => {
                  if (cancelRef.current) {
                    fetchImages(cancelRef.current.signal);
                  }
                }}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
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

interface ImageState {
  results: Image[];
  isLoading: boolean;
}
interface Image {
  url: string;
  isConverted: boolean;
}
