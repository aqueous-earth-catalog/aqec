import type { MDXComponents } from "mdx/types";
import { MapFocus } from "@/components/collections/map-focus";

const components: MDXComponents = {
  MapFocus,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
