export const openAppController = (c) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Open App</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript">
            function openApp() {
                var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                var deepLink = 'mychat://'; // <-- TODO: Replace with your app's deep link
                var appStoreLink = 'https://apps.apple.com/vn/app/zalo/id579523206'; // <-- TODO: Replace with your App Store link
                var playStoreLink = 'https://play.google.com/store/apps/details?id=com.zing.zalo'; // <-- TODO: Replace with your Play Store link
                var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                var isAndroid = /android/i.test(userAgent);

                if (isIOS) {
                    window.location.href = deepLink;
                    setTimeout(function() {
                        window.location.href = appStoreLink;
                    }, 2500);
                } else if (isAndroid) {
                    window.location.href = deepLink;
                    setTimeout(function() {
                        window.location.href = playStoreLink;
                    }, 2500);
                } else {
                    // Fallback for desktop or other OS
                    var messageElement = document.getElementById('message');
                    if(messageElement) {
                        messageElement.innerHTML = "Please open this link on your mobile device to proceed.";
                    }
                }
            }
            window.onload = openApp;
        </script>
    </head>
    <body>
        <h1>Opening App...</h1>
        <p>If you are not redirected automatically, please click the link for your store:</p>
        <ul>
            <li><a href="https://apps.apple.com/vn/app/zalo/id579523206">App Store (for iOS)</a></li>
            <li><a href="https://play.google.com/store/apps/details?id=com.zing.zalo">Google Play (for Android)</a></li>
        </ul>
        <div id="message"></div>
    </body>
    </html>
  `;
    return c.html(htmlContent);
};
