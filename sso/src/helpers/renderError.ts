function htmlSafe(input: number | string | boolean) {
  if (typeof input === "number" && Number.isFinite(input)) {
    return `${input}`;
  }

  if (typeof input === "string") {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (typeof input === "boolean") {
    return input.toString();
  }

  return "";
}

export async function renderError(ctx: any, out: any, error: any) {
  // eslint-disable-line no-unused-vars
  ctx.type = "html";
  ctx.body = `
  <!DOCTYPE html>
  <html class="no-js" lang="">
    <head>
      <meta charset="utf-8" />
      <title></title>
      <meta name="description" content="" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta property="og:title" content="Sign-in" />
      <meta property="og:type" content="" />
      <meta property="og:url" content="" />
      <meta property="og:image" content="" />

      <link rel="manifest" href="site.webmanifest" />
      <link rel="apple-touch-icon" href="icon.png" />
      <link rel="stylesheet" href="/main.css" />
      <!-- Place favicon.ico in the root directory -->

      <meta name="theme-color" content="#fafafa" />
    </head>

    <body class="bg-gray-200 h-screen">
      <div class="h-full w-full mt-32 flex flex-col content-center items-grow">
        <div class="flex justify-center">
          <h1 class="text-2xl font-bold">Something went wrong!</h1>
        </div>
        <div class="bg-white shadow mt-4 rounded mx-auto w-full max-w-sm">
          <div class="py-10 px-8" />
            ${Object.entries(out)
              .map(
                ([key, value]) =>
                  `<strong>${key}</strong>: ${htmlSafe(value as any)}<br />`
              )
              .join("")}
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
