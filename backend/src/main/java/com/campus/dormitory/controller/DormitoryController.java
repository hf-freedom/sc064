package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.AssignDormitoryRequest;
import com.campus.dormitory.entity.Bed;
import com.campus.dormitory.entity.DormitoryBuilding;
import com.campus.dormitory.entity.DormitoryRoom;
import com.campus.dormitory.enums.Gender;
import com.campus.dormitory.service.DormitoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dormitory")
public class DormitoryController {

    @Autowired
    private DormitoryService dormitoryService;

    @GetMapping("/buildings")
    public Result<List<DormitoryBuilding>> getAllBuildings() {
        return dormitoryService.getAllBuildings();
    }

    @GetMapping("/buildings/{buildingId}/rooms")
    public Result<List<DormitoryRoom>> getRoomsByBuilding(@PathVariable String buildingId) {
        return dormitoryService.getRoomsByBuilding(buildingId);
    }

    @GetMapping("/rooms/{roomId}/beds")
    public Result<List<Bed>> getBedsByRoom(@PathVariable String roomId) {
        return dormitoryService.getBedsByRoom(roomId);
    }

    @GetMapping("/beds/available")
    public Result<List<Bed>> getAvailableBeds(@RequestParam(required = false) String gender) {
        Gender g = gender != null ? Gender.valueOf(gender.toUpperCase()) : null;
        if (g != null) {
            return dormitoryService.getAvailableBedsByGender(g);
        }
        return Result.error("请指定性别");
    }

    @GetMapping("/beds/{bedId}")
    public Result<Bed> getBedById(@PathVariable String bedId) {
        return dormitoryService.getBedById(bedId);
    }

    @GetMapping("/rooms/{roomId}")
    public Result<DormitoryRoom> getRoomById(@PathVariable String roomId) {
        return dormitoryService.getRoomById(roomId);
    }

    @PostMapping("/assign")
    public Result<Bed> assignDormitory(@RequestBody AssignDormitoryRequest request) {
        return dormitoryService.assignDormitory(request);
    }
}
