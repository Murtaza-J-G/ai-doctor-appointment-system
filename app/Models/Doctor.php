<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'specialty', 'bio'])]
class Doctor extends Model
{
    public function appointments(){
        return $this->hasMany(Appointment::class);
    }

    public function availabilities(){
        return $this->hasMany(DoctorAvailability::class);
    }

    /**
     * 
     *  @return list<string>
     * 
     */

    public function slotsFor(Carbon $date){
        
        $availability = $this->availabilities->firstWhere('day_of_week', $date->dayOfWeek);

            if(!$availability){
                return[];
            }

            $slots = [];
            $start = Carbon::parse($availability->start_time);
            $end = Carbon::parse($availability->end_time);

            for($time = $start->copy(); $time < $end; $time->addHour()){
                $slots[] = $time->format('H:i');
            }
    
        return $slots;
    }
}
