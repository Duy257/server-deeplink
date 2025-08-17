import { Context } from "hono";

export const openAppController = (c: Context) => {
  const deeplink = c.req.query("link");
  const userAgent = c.req.header("User-Agent") || "";
  const appStoreLink = "https://apps.apple.com/vn/app/chainivo/id6748330113"; // <-- TODO: Replace with your App Store link
  const playStoreLink =
    "https://play.google.com/store/apps/details?id=com.innotech.chainivo"; // <-- TODO: Replace with your Play Store link

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /android/i.test(userAgent);

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
                const appStoreLink = '${appStoreLink}';
                const playStoreLink = '${playStoreLink}';
                const isIOS = ${isIOS};
                const isAndroid = ${isAndroid};

                if (isIOS || isAndroid) {
                    window.location.href = deepLink;

                    const timeout = 2500;
                    const start = Date.now();

                    setTimeout(function() {
                        const end = Date.now();
                        if (document.hidden || end - start >= timeout + 500) {
                            // App is likely open
                            return;
                        }
                        // App is not installed or failed to open
                        if (isIOS) {
                            window.location.href = appStoreLink;
                        } else if (isAndroid) {
                            window.location.href = playStoreLink;
                        }
                    }, timeout);
                } else {
                    // Fallback for desktop
                    window.location.href = deepLink;
                }
            }
            window.onload = openApp;
        </script>
    </head>
    <body>
        <h1>Redirecting...</h1>
        <p>If the app does not open automatically, please click the button below.</p>
        <a href="javascript:openApp()" class="button">Open App</a>
    </body>
    </html>
  `;

  return c.html(htmlContent);
};
