<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    // public function index(Request $request){
    //     $todayAppointments = Appointment::query()
    //         ->with('doctor')
    //         ->whereDate('scheduled_at', today())
    //         ->where('status', 'booked')
    //         ->count();

    //     $upcomingAppointments = Appointment::query()
    //         ->with('doctor')
    //         ->where('scheduled_at', '>=', now())
    //         ->where('status', 'booked')
    //         ->count();

    //     $totalDoctors = Doctor::count();

    //     $pendingReminders = Appointment::query()
    //         ->where('reminder_opt_in', true)
    //         ->whereNull('reminder_sent_at')
    //         ->where('scheduled_at', '>', now())
    //         ->count();

    //     $appointments = Appointment::query()
    //         ->with('doctor')
    //         ->where('user_id', $request->user()->id)
    //         ->where('scheduled_at', '>=', now())
    //         ->orderBy('scheduled_at')
    //         ->limit(5)
    //         ->get([
    //             'id',
    //             'doctor_id',
    //             'patient_name',
    //             'patient_email',
    //             'scheduled_at',
    //             'status',
    //         ]);

    //     return Inertia::render('dashboard', [
    //         'stats' => [
    //             'todayAppointments' => $todayAppointments,
    //             'upcomingAppointments' => $upcomingAppointments,
    //             'totalDoctors' => $totalDoctors,
    //             'pendingReminders' => $pendingReminders,
    //         ],

    //         'appointments' => $appointments,
    //     ]);
    // }

    public function index(Request $request)
{
    $user = $request->user();

    // ADMIN
    if ($user->is_admin) {

        $stats = [
            'todayAppointments' => Appointment::whereDate(
                'scheduled_at',
                today()
            )->count(),

            'upcomingAppointments' => Appointment::where(
                'scheduled_at',
                '>',
                now()
            )->count(),

            'totalDoctors' => Doctor::count(),

            'pendingReminders' => Appointment::where(
                'reminder_opt_in',
                true
            )
            ->whereNull('reminder_sent_at')
            ->where('scheduled_at', '>', now())
            ->count(),
        ];

        $appointments = Appointment::with('doctor')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'role' => 'admin',
            'stats' => $stats,
            'appointments' => $appointments,
        ]);
    }


    // NORMAL USER

    $appointmentsQuery = Appointment::with('doctor')
        ->where('user_id', $user->id);

    $stats = [
    'todayAppointments' => (clone $appointmentsQuery)
        ->whereDate('scheduled_at', today())
        ->where('status', 'booked')
        ->count(),

    'upcomingAppointments' => (clone $appointmentsQuery)
        ->where('scheduled_at', '>', now())
        ->where('status', 'booked')
        ->count(),

    'totalAppointments' => (clone $appointmentsQuery)
        ->count(),

    'pendingReminders' => (clone $appointmentsQuery)
        ->where('reminder_opt_in', true)
        ->whereNull('reminder_sent_at')
        ->where('scheduled_at', '>', now())
        ->count(),
];

    $appointments = $appointmentsQuery
        ->where('scheduled_at', '>', now())
        ->orderBy('scheduled_at')
        ->limit(10)
        ->get();

    return Inertia::render('dashboard', [
        'role' => 'user',
        'stats' => $stats,
        'appointments' => $appointments,
    ]);
}
}