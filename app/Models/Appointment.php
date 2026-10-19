<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['doctor_id', 'user_id', 'patient_name', 'patient_email', 'scheduled_at', 'reason', 'status', 'reminder_opt_in', 'reminder_sent_at'])]
class Appointment extends Model
{

    protected $casts = [
        'scheduled_at' => 'datetime',
        'reminder_opt_in' => 'boolean',
        'reminder_sent_at' => 'datetime'
    ];

    public function doctor(){
        return $this->belongsTo(Doctor::class);
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
}
