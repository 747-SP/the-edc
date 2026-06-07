import { AtpAgent, RichText } from "@atproto/api";
import type { Session } from "@/types";

const PDS_URL = "https://bsky.social";
let agent: AtpAgent | null = null;

export function createAgent(session: Session): AtpAgent {
  agent = new AtpAgent({ service: PDS_URL });
  agent.sessionManager.session = {
    did: session.did,
    handle: session.handle,
    accessJwt: session.accessJwt,
    refreshJwt: session.refreshJwt,
    active: true,
  };
  return agent;
}

export async function login(did: string, password: string) {
  const agent = new AtpAgent({ service: PDS_URL });
  const res = await agent.login({ identifier: did, password });
  return {
    did: res.data.did,
    handle: res.data.handle,
    accessJwt: res.data.accessJwt,
    refreshJwt: res.data.refreshJwt,
  } as Session;
}

export async function postImage(
  session: Session,
  imageFile: Buffer,
  altText: string,
  tags: string[]
) {
  const agent = createAgent(session);

  // Upload image blob
  const uploadRes = await agent.uploadBlob(imageFile, {
    encoding: "image/png",
  });

  // Build text with tags
  const tagText = "#TheEDC " + tags.map((t) => `#${t}`).join(" ");
  const fullText = altText ? `${altText}\n\n${tagText}` : tagText;

  // Auto-detect facets (hashtags, links, mentions) without resolution
  const rt = new RichText({ text: fullText });
  rt.detectFacetsWithoutResolution();

  // Create post with image embed and hashtag facets
  await agent.post({
    $type: "app.bsky.feed.post",
    text: rt.text,
    createdAt: new Date().toISOString(),
    facets: rt.facets?.length ? rt.facets : undefined,
    embed: {
      $type: "app.bsky.embed.images",
      images: [{ image: uploadRes.data.blob, alt: altText || "EDC item" }],
    },
  });
}

export async function fetchUserPosts(
  session: Session,
  since?: string,
  until?: string
) {
  const agent = createAgent(session);

  let cursor: string | undefined;
  let allItems: Array<{
    post: {
      uri: string;
      cid: string;
      record: Record<string, unknown>;
      indexedAt: string;
      author: { did: string; handle: string };
    };
  }> = [];

  // Paginate through all posts (up to reasonable limit)
  for (let page = 0; page < 10; page++) {
    const res = await agent.app.bsky.feed.getAuthorFeed({
      actor: session.did,
      limit: 50,
      cursor,
    });

    allItems = [...allItems, ...res.data.feed];

    if (!res.data.cursor) break;
    cursor = res.data.cursor;
  }

  // Filter by date range if provided
  const sinceMs = since ? new Date(since).getTime() : 0;
  const untilMs = until ? new Date(until + "T23:59:59Z").getTime() : Infinity;

  return allItems
    .filter((item) => {
      const record = item.post.record as Record<string, unknown> & { createdAt?: string };
      if (!record?.createdAt) return false;
      const postTime = new Date(record.createdAt).getTime();
      return postTime >= sinceMs && postTime <= untilMs;
    })
    .map((item) => ({
      uri: item.post.uri,
      cid: item.post.cid,
      post: {
        record: item.post.record as Record<string, unknown>,
        author: item.post.author,
        indexedAt: item.post.indexedAt,
      },
    }));
}
