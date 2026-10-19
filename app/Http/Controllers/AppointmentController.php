<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request){

        $appointments = Appointment::query()
            ->with('doctor:id,name,specialty')
                ->where('user_id', $request->user()->id)
                    ->orderBy('scheduled_at')
                        ->get();
        
        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
        ]);
    }

    
}
