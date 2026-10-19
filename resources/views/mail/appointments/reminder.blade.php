<x-mail::message>
# Appointment Reminder 

Hi {{ $appointment->patient_name }},

This is a friendly reminder of your upcoming appointment: 

- **Doctor:** {{ $appointment->doctor->name }} ({{ $appointment->doctor->specialty }})
- **When:** {{ $appointment->scheduled_at->format('l, F j \a\t g:i A') }}

If you need to change or cancel, just reply to this email.

See you soon,<br>
{{ config('app.name') }}
</x-mail::message>
