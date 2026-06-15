import { projectInfo } from "./projectInfo";

export type FeedbackSource = "about" | "place_card";

type FeedbackPlace = {
  id: string | number;
  name: string;
};

type BuildFeedbackUrlOptions = {
  source: FeedbackSource;
  place?: FeedbackPlace;
};

const PLACE_ERROR_TOPIC_ID = "9008980755561960";

function getCurrentPageUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.location.href;
}

export function buildFeedbackUrl({ source, place }: BuildFeedbackUrlOptions): string {
  const feedbackUrl = new URL(projectInfo.feedbackUrl);
  const pageUrl = getCurrentPageUrl();

  feedbackUrl.searchParams.set("source", source);

  if (pageUrl) {
    feedbackUrl.searchParams.set("page_url", pageUrl);
  }

  if (source === "place_card" && place) {
    feedbackUrl.searchParams.set("topic", PLACE_ERROR_TOPIC_ID);
    feedbackUrl.searchParams.set("place_id", String(place.id));
    feedbackUrl.searchParams.set("place_name", place.name);
  }

  return feedbackUrl.toString();
}
