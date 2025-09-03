export async function handler(event, context) {
  const SHELTERLUV_BASE = "https://new.shelterluv.com/api/v1/animals";
  const ALLOWED_PARAMS = ["status","species","size","age_group","sex","q","page","page_token","limit","sort","order"];
  const urlParams = new URLSearchParams(event.queryStringParameters || {});
  if (!urlParams.has("status")) urlParams.set("status", "available");
  if (!urlParams.has("limit")) urlParams.set("limit", "24");
  const upstream = new URL(SHELTERLUV_BASE);
  for (const [k, v] of urlParams.entries()) {
    if (ALLOWED_PARAMS.includes(k) && v) upstream.searchParams.set(k, v);
  }
  try {
    const resp = await fetch(upstream.toString(), {
      headers: { "Content-Type": "application/json", "X-Api-Key": process.env.SHELTERLUV_API_KEY }
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" }, body: JSON.stringify({ error:true, status:resp.status, message:text }) };
    }
    const data = await resp.json();
    return { statusCode: 200, headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"public, max-age=0, s-maxage=300, stale-while-revalidate=120" }, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" }, body: JSON.stringify({ error:true, message: err.message }) };
  }
}
