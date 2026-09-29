import Script from "next/script";

/**
 * Google Tag Manager and/or GA4, enabled by environment variables:
 *   NEXT_PUBLIC_GTM_ID  e.g. GTM-XXXXXXX (preferred: manage GA4, Google Ads and Meta tags in one place)
 *   NEXT_PUBLIC_GA_ID   e.g. G-XXXXXXXXXX (use this alone if you don't use GTM)
 *   NEXT_PUBLIC_CLARITY_ID  optional Microsoft Clarity heatmaps (spec 8.3); set masking to "Strict" in Clarity
 * Nothing loads when none is set. Name any tool you turn on in the privacy policy.
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
        </Script>
      )}
      {gaId && !gtmId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}
      {clarityId && (
        // Loads once the page is idle, so it never slows the first paint.
        <Script id="clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`}
        </Script>
      )}
    </>
  );
}
