<?php

namespace Database\Seeders;

use App\Models\Doctor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // day_of_week: 1 = Monday ... 5 = Friday
        $doctors = [
            ['name' => 'Dr. Neda Hakimi', 'specialty' => 'General Practitioner', 'bio' => 'Family medicine.',
                'availability' => [1 => ['09:00', '17:00'], 2 => ['09:00', '17:00'], 3 => ['09:00', '17:00'], 4 => ['09:00', '17:00'], 5 => ['09:00', '13:00']]],
            ['name' => 'Dr. Murtaza Hakimi', 'specialty' => 'Cardiologist', 'bio' => 'Heart health and ECG.',
                'availability' => [2 => ['10:00', '16:00'], 3 => ['10:00', '16:00'], 4 => ['10:00', '16:00']]],
            ['name' => 'Dr. Nargis Hakimi', 'specialty' => 'Dermatologist', 'bio' => 'Skin, hair, and nails.',
                'availability' => [1 => ['09:00', '13:00'], 3 => ['09:00', '13:00'], 5 => ['09:00', '13:00']]],
        ];

        foreach ($doctors as $data) {
            $doctor = Doctor::firstOrCreate(['name' => $data['name']], [
                'specialty' => $data['specialty'], 'bio' => $data['bio'],
            ]);

            foreach ($data['availability'] as $day => [$start, $end]) {
                $doctor->availabilities()->updateOrCreate(
                    ['day_of_week' => $day],
                    ['start_time' => $start, 'end_time' => $end],
                );
            }
        }
            }
}
