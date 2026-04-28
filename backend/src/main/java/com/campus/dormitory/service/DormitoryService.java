package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.AssignDormitoryRequest;
import com.campus.dormitory.entity.*;
import com.campus.dormitory.enums.*;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DormitoryService {

    @Autowired
    private DataStore dataStore;

    @Autowired
    private AccessCardService accessCardService;

    public Result<List<DormitoryBuilding>> getAllBuildings() {
        List<DormitoryBuilding> buildings = dataStore.getBuildings().values().stream()
                .collect(Collectors.toList());
        return Result.success(buildings);
    }

    public Result<List<DormitoryRoom>> getRoomsByBuilding(String buildingId) {
        List<String> roomIds = dataStore.getBuildingRoomMap().get(buildingId);
        if (roomIds == null) {
            return Result.success(java.util.Collections.emptyList());
        }
        List<DormitoryRoom> rooms = roomIds.stream()
                .map(id -> dataStore.getRooms().get(id))
                .collect(Collectors.toList());
        return Result.success(rooms);
    }

    public Result<List<Bed>> getBedsByRoom(String roomId) {
        List<String> bedIds = dataStore.getRoomBedMap().get(roomId);
        if (bedIds == null) {
            return Result.success(java.util.Collections.emptyList());
        }
        List<Bed> beds = bedIds.stream()
                .map(id -> dataStore.getBeds().get(id))
                .collect(Collectors.toList());
        return Result.success(beds);
    }

    public Result<List<Bed>> getAvailableBedsByGender(Gender gender) {
        List<Bed> beds = dataStore.getBeds().values().stream()
                .filter(bed -> bed.getStatus() == BedStatus.AVAILABLE)
                .filter(bed -> bed.getGenderRestriction() == gender)
                .collect(Collectors.toList());
        return Result.success(beds);
    }

    public Result<Bed> assignDormitory(AssignDormitoryRequest request) {
        Student student = dataStore.getStudents().get(request.getStudentId());
        if (student == null) {
            return Result.error("学生不存在");
        }

        if (student.getAccommodationStatus() == AccommodationStatus.ACCOMMODATED) {
            return Result.error("学生已有住宿，不能再次分配");
        }

        if (student.getArrearsStatus() == ArrearsStatus.ARREARS ||
                student.getArrearsStatus() == ArrearsStatus.OVERDUE_ARREARS) {
            return Result.error("学生存在欠费，不能分配宿舍");
        }

        Bed bed = dataStore.getBeds().get(request.getBedId());
        if (bed == null) {
            return Result.error("床位不存在");
        }

        if (bed.getStatus() != BedStatus.AVAILABLE) {
            return Result.error("床位已被占用或维护中");
        }

        if (bed.getGenderRestriction() != student.getGender()) {
            return Result.error("性别不匹配，不能分配该床位");
        }

        bed.setStatus(BedStatus.OCCUPIED);
        bed.setStudentId(student.getStudentId());
        dataStore.getBeds().put(bed.getBedId(), bed);

        student.setAccommodationStatus(AccommodationStatus.ACCOMMODATED);
        student.setCurrentBedId(bed.getBedId());
        student.setCheckInDate(LocalDate.now());
        dataStore.getStudents().put(student.getStudentId(), student);

        accessCardService.createAccessCard(student.getStudentId(), bed.getBedId(), bed.getBuildingId());

        return Result.success("宿舍分配成功", bed);
    }

    public Result<Bed> getBedById(String bedId) {
        Bed bed = dataStore.getBeds().get(bedId);
        if (bed == null) {
            return Result.error("床位不存在");
        }
        return Result.success(bed);
    }

    public Result<DormitoryRoom> getRoomById(String roomId) {
        DormitoryRoom room = dataStore.getRooms().get(roomId);
        if (room == null) {
            return Result.error("房间不存在");
        }
        return Result.success(room);
    }
}
