package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.CheckOutRequest;
import com.campus.dormitory.entity.Bed;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.entity.UtilityBill;
import com.campus.dormitory.enums.AccommodationStatus;
import com.campus.dormitory.enums.BedStatus;
import com.campus.dormitory.enums.BillStatus;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CheckOutService {

    @Autowired
    private DataStore dataStore;

    @Autowired
    private AccessCardService accessCardService;

    @Autowired
    private UtilityBillService utilityBillService;

    public Result<Student> checkOut(CheckOutRequest request) {
        Student student = dataStore.getStudents().get(request.getStudentId());
        if (student == null) {
            return Result.error("学生不存在");
        }

        if (student.getAccommodationStatus() != AccommodationStatus.ACCOMMODATED) {
            return Result.error("学生当前未入住");
        }

        if (student.getCurrentBedId() == null || !student.getCurrentBedId().equals(request.getBedId())) {
            return Result.error("床位信息不匹配");
        }

        if (utilityBillService.hasOutstandingBills(student.getStudentId())) {
            return Result.error("学生存在未结清的水电费，无法退宿");
        }

        accessCardService.deactivateAccessCard(student.getStudentId());

        Bed bed = dataStore.getBeds().get(request.getBedId());
        if (bed != null) {
            bed.setStatus(BedStatus.AVAILABLE);
            bed.setStudentId(null);
            dataStore.getBeds().put(bed.getBedId(), bed);
        }

        student.setAccommodationStatus(AccommodationStatus.CHECKED_OUT);
        student.setCurrentBedId(null);
        student.setCheckInDate(null);
        dataStore.getStudents().put(student.getStudentId(), student);

        return Result.success("退宿成功", student);
    }
}
