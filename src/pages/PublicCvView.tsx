import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { smartApplyAPI } from "@/services/api";
import { CvPreviewByTemplate, type CvPreviewData } from "@/components/cv-templates/CvTemplatePreviews";
import { Loader2, Download } from "lucide-react";

const PublicCvView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ templateId: number; cvData: CvPreviewData } | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Invalid link");
      setLoading(false);
      return;
    }
    smartApplyAPI
      .getPublicCV(slug)
      .then((res: { templateId?: number; cvData?: CvPreviewData }) => {
        if (res?.cvData && res?.templateId) {
          setData({ templateId: res.templateId, cvData: res.cvData });
        } else {
          setError("CV not found");
        }
      })
      .catch((err) => setError(err?.message || "Could not load CV"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <SEO title="Online CV – Smart Apply" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <SEO title="CV Not Found – Smart Apply" />
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">CV Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "This link may have expired."}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleLinkClick = useCallback((url: string) => {
    if (!slug) return;
    smartApplyAPI.recordPublicCvAnalytics(slug, "link_click", url).catch(() => {});
  }, [slug]);

  const handleDownload = useCallback(() => {
    if (!slug) return;
    smartApplyAPI.recordPublicCvAnalytics(slug, "download").catch(() => {});
    window.print();
  }, [slug]);

  return (
    <Layout>
      <SEO title={`${data.cvData.personal?.fullName || "CV"} – Online CV`} />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <div className="flex justify-end mb-2 print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 p-2 sm:p-4">
            <CvPreviewByTemplate templateId={data.templateId} data={data.cvData} onLinkClick={handleLinkClick} />
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Scanned from a printed CV · Smart Apply</p>
        </div>
      </div>
    </Layout>
  );
};

export default PublicCvView;
