package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.RoomChangeRequest;
import com.campus.dormitory.entity.Bed;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.enums.AccommodationStatus;
import com.campus.dormitory.enums.ArrearsStatus;
import com.campus.dormitory.enums.BedStatus;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomChangeService {

    private static final int MAX_DISCIPLINE_COUNT = 3;

    @Autowired
    private DataStore dataStore;

    @Autowired
    private AccessCardService accessCardService;

    @Autowired
    private UtilityBillService utilityBillService;

    public Result<Student> changeRoom(RoomChangeRequest request) {
        Student student = dataStore.getStudents().get(request.getStudentId());
        if (student == null) {
            return Result.error("学生不存在");
        }

        if (student.getAccommodationStatus() != AccommodationStatus.ACCOMMODATED) {
            return Result.error("学生当前未入住");
        }

        if (student.getCurrentBedId() == null || !student.getCurrentBedId().equals(request.getOldBedId())) {
            return Result.error("旧床位信息不匹配");
        }

        if (student.getDisciplineCount() >= MAX_DISCIPLINE_COUNT) {
            return Result.error("学生违纪次数过多，不能申请换宿");
        }

        if (student.getArrearsStatus() == ArrearsStatus.ARREARS ||
                student.getArrearsStatus() == ArrearsStatus.OVERDUE_ARREARS) {
            return Result.error("学生存在欠费，不能申请换宿");
        }

        Bed newBed = dataStore.getBeds().get(request.getNewBedId());
        if (newBed == null) {
            return Result.error("新床位不存在");
        }

        if (newBed.getStatus() != BedStatus.AVAILABLE) {
            return Result.error("新床位已被占用或维护中");
        }

        if (newBed.getGenderRestriction() != student.getGender()) {
            return Result.error("新床位性别不匹配");
        }

        Bed oldBed = dataStore.getBeds().get(request.getOldBedId());
        if (oldBed != null) {
            oldBed.setStatus(BedStatus.AVAILABLE);
            oldBed.setStudentId(null);
            dataStore.getBeds().put(oldBed.getBedId(), oldBed);
        }

        newBed.setStatus(BedStatus.OCCUPIED);
        newBed.setStudentId(student.getStudentId());
        dataStore.getBeds().put(newBed.getBedId(), newBed);

        student.setCurrentBedId(newBed.getBedId());
        dataStore.getStudents().put(student.getStudentId(), student);

        accessCardService.transferAccessCard(student.getStudentId(), newBed.getBedId(), newBed.getBuildingId());

        return Result.success("换宿成功", student);
    }
}
