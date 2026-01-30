import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { handleMidtransWebhook } from "@/domain/webhooks/midtransWebhook.service";

export async function POST(req) {
  try {
    const body = await req.json();
    const data = await handleMidtransWebhook(body);
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
