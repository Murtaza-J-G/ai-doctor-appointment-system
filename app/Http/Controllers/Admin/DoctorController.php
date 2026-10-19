<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class DoctorController extends Controller
{
    public function index(){
        return Inertia('admin/doctors/index', [
            'doctors' => Doctor::with('availabilities')->orderBy('name')->get(),

        ]);
    }

    private function validateDoctor(Request $request): array
        {
            return $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'specialty' => ['required', 'string', 'max:255'],
                'bio' => ['nullable', 'string'],
                'availabilities' => ['array'],
                'availabilities.*.day_of_week' => ['required', 'integer', 'between:0,6'],
                'availabilities.*.start_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
                'availabilities.*.end_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            ]);
        }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateDoctor($request);
        $doctor = Doctor::create(Arr::only($data, ['name', 'specialty', 'bio']));
        $this->syncAvailabilities($doctor, $data['availabilities'] ?? []);

        return redirect()->route('admin.doctors.index');
    }

    public function update(Request $request, Doctor $doctor): RedirectResponse
    {
        $data = $this->validateDoctor($request);
        $doctor->update(Arr::only($data, ['name', 'specialty', 'bio']));
        $this->syncAvailabilities($doctor, $data['availabilities'] ?? []);

        return redirect()->route('admin.doctors.index');
    }

    public function destroy(Doctor $doctor): RedirectResponse
    {
        $doctor->delete();

        return redirect()->route('admin.doctors.index');
    }

    private function syncAvailabilities(Doctor $doctor, array $availabilities): void
    {
        $doctor->availabilities()->delete();

        foreach ($availabilities as $row) {
            $doctor->availabilities()->create($row);
        }
    }

}
