# Legacy Google Sheets webhook (not used by current appointment intake)

The current booking flow is `POST /api/appointment` and uses EmailJS only. It does not call Google Sheets, Apps Script, or any booking/payment webhook. Do not deploy this receiver or configure its webhook secrets for appointment intake unless the clinic owner explicitly requests a separate, persistent record system.

`Code.gs` is retained only as legacy source reference. It is not invoked by the current Pages Function. The current appointment reference (`BHC-YYYYMMDD-XXXXXXXX`) is included in EmailJS messages but is not backed by a durable database; the limitation is described in the main [`README.md`](../README.md).

The website's separate callback flow is not part of appointment processing. Do not use this legacy guide to alter that flow.
