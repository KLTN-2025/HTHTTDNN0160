<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with('owner')->get();
        return response()->json($rooms);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
            'password' => 'nullable|string|max:255',
        ]);

        $room = Room::create([
            'name' => $request->name,
            'room_code' => Str::upper(Str::random(6)),
            'description' => $request->description,
            'is_private' => $request->is_private ?? false,
            'password' => $request->is_private ? $request->password : null,
            'owner_id' => $request->user()->id,
        ]);

        return response()->json($room, 201);
    }

    public function show(Request $request, Room $room)
    {
        if ($room->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bạn không có quyền xem phòng này'
            ], 403);
        }

        $room->load('owner');
        return response()->json($room);
    }

    public function update(Request $request, Room $room)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
            'password' => 'nullable|string|max:255',
        ]);

        $room->update([
            'name' => $request->name ?? $room->name,
            'description' => $request->description ?? $room->description,
            'is_private' => $request->is_private ?? $room->is_private,
            'password' => ($request->is_private ?? $room->is_private) ? $request->password : null,
        ]);

        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(['message' => 'Room deleted']);
    }
}
