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
  ctx.body = `<!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>oops! something went wrong</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <style>
        @import url(https://fonts.googleapis.com/css?family=Roboto:400,100);h1{font-weight:100;text-align:center;font-size:2.3em}body{font-family:Roboto,sans-serif;margin-top:25px;margin-bottom:25px}.container{padding:0 40px 10px;width:274px;background-color:#F7F7F7;margin:0 auto 10px;border-radius:2px;box-shadow:0 2px 2px rgba(0,0,0,.3);overflow:hidden}pre{white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;margin:0 0 0 1em;text-indent:-1em}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>oops! something went wrong</h1>
        ${Object.entries(out)
          .map(
            ([key, value]) =>
              `<pre><strong>${key}</strong>: ${htmlSafe(value as any)}</pre>`
          )
          .join("")}
      </div>
    </body>
    </html>`;
}
