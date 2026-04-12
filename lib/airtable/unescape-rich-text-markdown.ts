/**
 * Airtable's REST API can add backslashes before Markdown punctuation when you
 * read a long-text field that has rich formatting enabled. Those backslashes
 * mean "show the symbol, do not treat it as formatting" in Markdown parsers, so
 * bold can appear as literal ** characters while links still work.
 *
 * @see https://support.airtable.com/docs/using-markdown-in-airtable (footnote 4)
 */
export function unescapeAirtableRichTextMarkdown(text: string): string {
  return text.replace(/\\([*#[\]`_~>])/g, "$1");
}
