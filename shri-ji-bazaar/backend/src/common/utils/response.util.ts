export function successResponse<T>(res: import('express').Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function errorResponse(res: import('express').Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}
