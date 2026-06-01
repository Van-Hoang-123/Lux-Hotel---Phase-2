# Payment API notes

Payment in the frontend follows the API sheet:

- `PATCH /api/bookings/{bookingId}/complete-payment`
- Authorized role: `Admin`
- Input: booking id in the route
- Expected effect: set the related payment status to `Completed`

Frontend behavior:

- Guest users never see the complete payment action.
- Admin users load `/api/bookings` first so they can manage all bookings, then fall back to `/api/bookings/my` if that endpoint is not available.
- Admin users can complete payment for `Confirmed` or `Pending` bookings.
- If the deployed backend does not expose the payment endpoint yet, the UI shows a clear backend unavailable message.

Backend check:

- The current live Swagger at `hotel.xomnhala.vn/swagger/v1/swagger.json` does not list `complete-payment`.
- The backend must expose the endpoint above and create/store a pending payment when a booking is created.
- Admin credentials should be provisioned through backend seed/config values, not committed in frontend files.
