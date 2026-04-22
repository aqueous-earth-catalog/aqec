export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-[#d3eff0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl prose prose-sm sm:prose-base prose-headings:font-semibold prose-headings:tracking-normal prose-p:leading-7 prose-p:text-slate-700 prose-h1:mt-8 prose-h1:mb-3 prose-h2:mt-6 prose-h2:mb-2">
          {children}
        </div>
      </div>
    </section>
  );
}
