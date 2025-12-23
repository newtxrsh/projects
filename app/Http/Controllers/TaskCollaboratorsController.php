<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaskCollaborator;

class TaskCollaboratorsController extends Controller
{
    public function apiIndex()
    {
        $taskCollaborators = TaskCollaborator::with(['user','task'])->get();
        return response()->json($taskCollaborators);
    }

    public function index()
    {
        return $this->apiIndex();
    }
}
