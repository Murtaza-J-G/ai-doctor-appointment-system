<?php

namespace App\Ai\Tools;

use App\Models\Appointment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class SetAppointmentReminder implements Tool
{

    public function name(){
        return 'set_appointment_reminder';
    }

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Turn an email reminder on or off for an appointment that was just booked. '
            .'Call this after booking, once the patient has said whether they want an '
            .'email reminder about 24 hours before their appointment.';

    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $appointment = Appointment::query()
            ->where('id', $request['appointment_id'])
                ->when(auth()->id(), fn ($query, $id) => $query->where('user_id', $id))
                    ->first();

        
        if(!$appointment){
            return 'I could not find that appointment to update.';
        }

        $optIn = (bool) $request['opt_in'];

        $appointment->update(['reminder_opt_in' =>$optIn]);

        return $optIn
            ? "Email reminder turned on for appointment #{$appointment->id}. We'll email {$appointment->patient_email} about 24 hours before."
            : "Email reminder turned off for appointment #{$appointment->id}.";
        
        


    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'appointment_id' => $schema->integer()
                ->description('The numeric id of the appointment, from book_appointment.')
                    ->required(),
            'opt_in' => $schema->boolean()
                ->description('True if the patient wants an email reminder, false if not.')
                    ->required(),
        ];
    }
}
