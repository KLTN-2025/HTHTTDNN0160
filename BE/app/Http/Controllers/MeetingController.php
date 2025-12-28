<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::all();
        return response()->json($meetings);
    }

    public function createNowMeeting(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'room_id' => 'nullable|exists:rooms,id',
            'time_start' => 'nullable|date',
            'time_end' => 'nullable|date|after:time_start',
            'passcode' => 'nullable|string|max:255',
            'is_waiting' => 'boolean',
            'is_user_allowed_pass_waiting' => 'boolean',
        ]);

        $data['time_start'] = now();
        $data['time_end'] ??= now()->addHours(2);

        $data['owner_id'] = $user->id;

        $meeting = Meeting::create($data);

        return response()->json($meeting, 201);
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'nullable|exists:rooms,id',
            'time_start' => 'nullable|date',
            'time_end' => 'nullable|date|after:time_start',
            'passcode' => 'nullable|string|max:255',
            'is_waiting' => 'boolean',
            'is_user_allowed_pass_waiting' => 'boolean',
        ]);

        $conflict = Meeting::where('room_id', $request->room_id)
            ->where(function ($q) use ($request) {
                $q->whereBetween('time_start', [$request->time_start, $request->time_end])
                    ->orWhereBetween('time_end', [$request->time_start, $request->time_end])
                    ->orWhere(function ($q2) use ($request) {
                        $q2->where('time_start', '<=', $request->time_start)
                            ->where('time_end', '>=', $request->time_end);
                    });
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'Thời gian họp bị trùng trong phòng này'], 422);
        }

        $meeting = Meeting::create([
            'room_id' => $request->room_id,
            'owner_id' => $request->user()->id,
            'time_start' => $request->time_start,
            'time_end' => $request->time_end,
            'passcode' => $request->passcode,
            'is_waiting' => $request->is_waiting ?? false,
            'is_user_allowed_pass_waiting' => $request->is_user_allowed_pass_waiting ?? false,
        ]);
        return response()->json($meeting, 201);
    }

    public function show(Meeting $meeting)
    {
        return response()->json($meeting);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $request->validate([
            'room_id' => 'sometimes|exists:rooms,id',
            'time_start' => 'sometimes|date',
            'time_end' => 'sometimes|date|after:time_start',
            'passcode' => 'nullable|string|max:255',
            'is_waiting' => 'boolean',
            'is_user_allowed_pass_waiting' => 'boolean',
        ]);

        $conflict = Meeting::where('room_id', $request->room_id ?? $meeting->room_id)
            ->where('id', '!=', $meeting->id)
            ->where(function ($q) use ($request, $meeting) {
                $start = $request->time_start ?? $meeting->time_start;
                $end = $request->time_end ?? $meeting->time_end;
                $q->whereBetween('time_start', [$start, $end])
                    ->orWhereBetween('time_end', [$start, $end])
                    ->orWhere(function ($q2) use ($start, $end) {
                        $q2->where('time_start', '<=', $start)
                            ->where('time_end', '>=', $end);
                    });
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'Thời gian họp bị trùng trong phòng này'], 422);
        }

        $meeting->update([
            'room_id' => $request->room_id,
            'owner_id' => $request->user()->id,
            'time_start' => $request->time_start,
            'time_end' => $request->time_end,
            'passcode' => $request->passcode,
            'is_waiting' => $request->is_waiting ?? false,
            'is_user_allowed_pass_waiting' => $request->is_user_allowed_pass_waiting ?? false,
        ]);
        return response()->json($meeting);
    }

    public function destroy(Meeting $meeting)
    {
        $meeting->delete();
        return response()->json(['message' => 'Meeting deleted']);
    }
}
