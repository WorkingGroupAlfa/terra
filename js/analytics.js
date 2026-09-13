/* Creekside Plumbing & Gas — analytics (Google Analytics 4 + Google Ads conversions)
   Fill in the IDs below. While they're empty nothing is loaded and nothing is sent.

   GA4 events:  generate_lead     — quote form submitted
                job_application   — job application submitted
                click_to_call     — business phone number tapped
   Mark generate_lead and click_to_call as key events in GA4. */
(function () {
  'use strict';

  const GA4_ID = '';          // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'
  const ADS_ID = '';          // Google Ads tag ID, e.g. 'AW-123456789'
  const ADS_LEAD_LABEL = '';  // Ads conversion label for quote requests
  const ADS_CALL_LABEL = '';  // Ads conversion label for phone clicks

  const BUSINESS_TEL = '+61407699455';

  if (!GA4_ID && !ADS_ID) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  if (GA4_ID) gtag('config', GA4_ID);
  if (ADS_ID) gtag('config', ADS_ID);

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID || ADS_ID);
  document.head.appendChild(tag);

  function adsConversion(label) {
    if (ADS_ID && label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  }

  // Dispatched by js/ui.js after a successful submit; carries no names or phone numbers
  document.addEventListener('creekside:lead', (e) => {
    const d = e.detail || {};
    if (d.type === 'quote') {
      gtag('event', 'generate_lead', {
        form_name: 'quote',
        situation: d.situation,
        property_type: d.property,
        preferred_time: d.time
      });
      adsConversion(ADS_LEAD_LABEL);
    } else if (d.type === 'job-application') {
      gtag('event', 'job_application');
    }
  });

  // Taps on the business number (not the gas emergency or 000 links)
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!link || link.getAttribute('href').slice(4) !== BUSINESS_TEL) return;
    const section = link.closest('[data-screen-label]');
    gtag('event', 'click_to_call', { link_location: section ? section.dataset.screenLabel : 'Other' });
    adsConversion(ADS_CALL_LABEL);
  });
})();
