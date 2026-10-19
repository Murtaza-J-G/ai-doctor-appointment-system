<?php

namespace App\Ai\Tools;

use App\Models\Appointment;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class CheckDoctorAvailability implements Tool
{

    public function name(){
        return 'check_doctor_availability';
    }

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Check which appointment time slots a doctor has free. Pass a single date to
            check that day, or pass days=7 (or more) to scan a whole week and offer the
            patient\'s alternatives if their preferred day is full or off. Each doctor sets
            their own weekly schedule, so always check here before promising a time. Call
            list_doctors first to get the doctor id.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $doctor = Doctor::find($request['doctor_id']);

        if (!$doctor) {
            return 'There is no doctor with that id. Use list_doctors to find a valid id.';
        }

        $start = Carbon::parse($request['date'])->startOfDay();
        $days = max(1, min((int) ($request['days'] ?? 1), 14));

        $lines = [];

        for ($offset = 0; $offset < $days; $offset++) {
            $date = $start->copy()->addDays($offset);

            $free = $this->freeSlotsFor($doctor, $date);

            // When scanning a range, quietly skip days the doctor is off or full
            // so the patient only sees days they can actually pick from.
            if ($days > 1 && empty($free)) {
                continue;
            }

            if (empty($free)) {
                $slots = $doctor->slotsFor($date);

                $lines[] = empty($slots)
                    ? "{$doctor->name} does not work on {$date->format('l, F j')}."
                    : "{$doctor->name} is fully booked on {$date->format('l, F j')}.";

                continue;
            }

            $lines[] = "{$date->format('l, F j')}: " . implode(', ', $free);
        }

        if (empty($lines)) {
            return "{$doctor->name} has no open slots in that window. Try a later week.";
        }

        return $days > 1
            ? "{$doctor->name}'s open slots:\n" . implode("\n", $lines)
            : $lines[0];


    }
    
    protected function freeSlotsFor(Doctor $doctor, Carbon $date)
    {
        $slots = $doctor->slotsFor($date);

        if (empty($slots)) {
            return [];
        }

        $booked = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('scheduled_at', $date)
            ->get()
            ->map(fn (Appointment $appointment) => $appointment->scheduled_at->format('H:i'))
            ->all();

        // Never offer a time that has already passed today.
        $free = array_filter(
            array_diff($slots, $booked),
            fn (string $time) => Carbon::parse(
                "{$date->toDateString()} {$time}"
            )->isFuture()
        );

        return array_values($free);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
                'doctor_id' => $schema->integer()
                    ->description('Doctor id from list_doctors.')
                    ->required(),

                'date' => $schema->string()
                    ->description('Date to check, YYYY-MM-DD.')
                    ->required(),

                'days' => $schema->integer()->description('How many days from the start date to scan. Use 1 for a single day, or 7 to show a whole week of alternatives. Defaults to 1.'),
            ];
    }
}
