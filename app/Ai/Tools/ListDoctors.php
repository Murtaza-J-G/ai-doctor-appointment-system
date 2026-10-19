<?php

namespace App\Ai\Tools;

use App\Models\Doctor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Stringable;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListDoctors implements Tool
{

    public function name(){
        return 'list_doctors';
    }
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'List the doctors at this clinic, optionally filtered by specialty.'
                .'Use this to find a doctor and their numeric id before checking'
                .'availability or booking.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $doctors = Doctor::query()
        ->when($request['specialty'] ?? null, fn ($query, $specialty) =>
            $query->where('specialty', 'like', "%{$specialty}%")
        )
        ->orderBy('name')
        ->get(['id', 'name', 'specialty', 'bio']);

        if($doctors->isEmpty()){
            return 'No doctors matched that search.';
        }

        return $doctors->map(fn(Doctor $d) => "#{$d->id}: {$d->name} - {$d->specialty}. {$d->bio}")->implode("\n");

    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'specialty' => $schema->string()->description('Optional Specialty filter, e.g. "Cardiologist".'),
        ];
    }
}
