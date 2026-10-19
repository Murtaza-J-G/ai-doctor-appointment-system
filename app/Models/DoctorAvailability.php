<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['doctor_id', 'day_of_week', 'start_time', 'end_time'])]
class DoctorAvailability extends Model
{
    protected $casts = ['day_of_week' => 'integer'];

    public function doctor(){
        return $this->belongsTo(Doctor::class);
    }
}
