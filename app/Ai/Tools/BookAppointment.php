<?php

namespace App\Ai\Tools;

use App\Models\Appointment;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class BookAppointment implements Tool
{

    public function name(){
        return 'book_appointment';
    }
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Book an appointment for a patient with a doctor at a specific date and time. '
            .'Only call this after you have confirmed the doctor, date, time, and the '
                .'patient\'s name and email with the user.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $doctor = Doctor::find($request['doctor_id']);

        if(!$doctor){
            return 'There is no doctor with that id. Use list_doctors to find a valid id.';
        }

        $time = $request['time'];

        $scheduledAt = Carbon::parse("{$request['date']} {$time}");

        if($scheduledAt->isPast()){
            return 'That time is in the past. Please choose a future slot.';
        }

        $slots = $doctor->slotsFor($scheduledAt);

        if (!in_array($time, $slots, true)) {
            return empty($slots)
                ? "{$doctor->name} does not work on that day. Use check_doctor_availability to find an open day."
                : "{$time} is not one of {$doctor->name}'s slots that day. Available: " . implode(', ', $slots) . '.';
            }

        $alreadyBooked = Appointment::query()
            ->where('doctor_id', $doctor->id)
                ->where('scheduled_at', $scheduledAt)
                    ->exists();
        
        if($alreadyBooked){
            return "{$doctor->name} already has an appointment at {$time} on that day. Please pick another slot.";
        }            

        $appointment = Appointment::create([
            'doctor_id' => $doctor->id,
            'user_id' => auth()->id(),
            'patient_name' => $request['patient_name'],
            'patient_email' => $request['patient_email'],
            'scheduled_at' => $scheduledAt,
            'reason' => $request['reason'] ?? null,
            'status' => 'booked',
        ]);

        return "Appointment #{$appointment->id} confirmed: {$request['patient_name']} with "
            ."{$doctor->name} on {$scheduledAt->toDayDateTimeString()}. "
            ."Now ask the patient if they would like an email reminder, then use set_appointment_reminder.";

        


    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'doctor_id' => $schema->integer()->description('Doctor id from list_doctors.')->required(),
            'date' => $schema->string()->description('Appointment date, YYYY-MM-DD.')->required(),
            'time' => $schema->string()->description('Start time as HH:MM, e.g. "14:00".')->required(),
            'patient_name' => $schema->string()->description('Patient full name.')->required(),
            'patient_email' => $schema->string()->description('Email for the confirmation.')->required(),
            'reason' => $schema->string()->description('Reason for the visit, if given.'),
        ];

    }
}
