import { handleDeviceCode } from "../../_lib/deviceFlow.js";

export function POST(request: Request) {
  return handleDeviceCode(request, process.env);
}
