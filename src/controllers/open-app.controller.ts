import { Context } from "hono";

const APP_STORE_LINK = "https://apps.apple.com/vn/app/chainivo/id6748330113"; // <-- TODO: Replace with your App Store link
const PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=com.innotech.chainivo"; // <-- TODO: Replace with your Play Store link
const FALLBACK_DESKTOP_URL = "https://your-website.com"; // <-- TODO: Replace with your website URL

export const openAppController = (c: Context) => {
  const deeplink = c.req.query("link");
  const userAgent = c.req.header("User-Agent") || "";

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /android/i.test(userAgent);

  let fallbackStoreUrl = FALLBACK_DESKTOP_URL;
  if (isIOS) {
    fallbackStoreUrl = APP_STORE_LINK;
  } else if (isAndroid) {
    fallbackStoreUrl = PLAY_STORE_LINK;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Open App</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; }
        </style>
        <script type="text/javascript">
            function openApp() {
                const deepLink = '${deeplink}';
                const fallbackUrl = '${fallbackStoreUrl}';
                const isMobile = ${isIOS || isAndroid};

                if (isMobile) {
                    window.location.href = deepLink;

                    const timeout = 2500;
                    const start = Date.now();

                    setTimeout(function() {
                        const end = Date.now();
                        // If the page is hidden or the time elapsed is significant, the app is likely open.
                        if (document.hidden || document.msHidden || document.webkitHidden || end - start >= timeout + 500) {
                            return;
                        }
                        // App is not installed or failed to open, redirect to the store.
                        window.location.href = fallbackUrl;
                    }, timeout);
                } else {
                    // Fallback for desktop: redirect to a website.
                    window.location.href = fallbackUrl;
                }
            }
            window.onload = openApp;
        </script>
    </head>
    <body>
        <h1>Redirecting...</h1>
        <p>If the app does not open automatically, please click the button below.</p>
    </body>
    </html>
  `;

  return c.html(htmlContent);
};
