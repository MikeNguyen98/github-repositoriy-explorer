import { handleDeviceToken } from "../../_lib/deviceFlow.js";

export function POST(request: Request) {
  return handleDeviceToken(request, process.env);
}
