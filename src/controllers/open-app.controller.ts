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
        <script type="text/javascript">
            function openApp() {
                var deepLink = '${deeplink}';
                var appStoreLink = '${appStoreLink}';
                var playStoreLink = '${playStoreLink}';
                var isIOS = ${isIOS};
                var isAndroid = ${isAndroid};

                if (isIOS) {
                    window.location.href = deepLink;
                    setTimeout(function() {
                        window.location.href = appStoreLink;
                    }, 500);
                } else if (isAndroid) {
                    window.location.href = deepLink;
                    setTimeout(function() {
                        window.location.href = playStoreLink;
                    }, 500);
                } else {
                    window.location.href = deepLink;
                }
            }
            window.onload = openApp;
        </script>
    </head>
    <body>
        <p>Redirecting...</p>
    </body>
    </html>
  `;

  return c.html(htmlContent);
};
