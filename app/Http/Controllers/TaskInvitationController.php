<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitationActionRequest;
use App\Http\Resources\TaskInvitationResource;
use App\Models\TaskInvitation;
use App\Services\TaskCollaborationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskInvitationController extends Controller
{
    public function index(Request $request, TaskCollaborationService $service): JsonResponse
    {
        return response()->json(TaskInvitationResource::collection($service->pending($request->user()))->resolve($request));
    }

    public function accept(InvitationActionRequest $request, TaskInvitation $invitation, TaskCollaborationService $service): JsonResponse
    {
        $invitation = $service->accept($invitation, $request->user());

        return response()->json((new TaskInvitationResource($invitation))->resolve($request));
    }

    public function decline(InvitationActionRequest $request, TaskInvitation $invitation, TaskCollaborationService $service): JsonResponse
    {
        $invitation = $service->decline($invitation, $request->user());

        return response()->json((new TaskInvitationResource($invitation))->resolve($request));
    }
}
