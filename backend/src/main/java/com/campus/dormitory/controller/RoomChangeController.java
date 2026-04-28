package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.RoomChangeRequest;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.service.RoomChangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room-change")
public class RoomChangeController {

    @Autowired
    private RoomChangeService roomChangeService;

    @PostMapping
    public Result<Student> changeRoom(@RequestBody RoomChangeRequest request) {
        return roomChangeService.changeRoom(request);
    }
}
