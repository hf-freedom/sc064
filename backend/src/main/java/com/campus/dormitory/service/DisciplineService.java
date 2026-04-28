package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.DisciplineRecord;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DisciplineService {

    @Autowired
    private DataStore dataStore;

    public Result<DisciplineRecord> addDisciplineRecord(DisciplineRecord record) {
        record.setRecordId("DR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        record.setViolationDate(LocalDate.now());

        dataStore.getDisciplineRecords().put(record.getRecordId(), record);

        Student student = dataStore.getStudents().get(record.getStudentId());
        if (student != null) {
            student.setDisciplineCount(student.getDisciplineCount() + 1);
            dataStore.getStudents().put(student.getStudentId(), student);
        }

        if (!dataStore.getStudentDisciplineMap().containsKey(record.getStudentId())) {
            dataStore.getStudentDisciplineMap().put(record.getStudentId(), new java.util.ArrayList<>());
        }
        dataStore.getStudentDisciplineMap().get(record.getStudentId()).add(record.getRecordId());

        return Result.success("违纪记录添加成功", record);
    }

    public Result<List<DisciplineRecord>> getRecordsByStudent(String studentId) {
        List<String> recordIds = dataStore.getStudentDisciplineMap().get(studentId);
        if (recordIds == null || recordIds.isEmpty()) {
            return Result.success(java.util.Collections.emptyList());
        }
        List<DisciplineRecord> records = recordIds.stream()
                .map(id -> dataStore.getDisciplineRecords().get(id))
                .collect(Collectors.toList());
        return Result.success(records);
    }

    public Result<List<DisciplineRecord>> getAllRecords() {
        List<DisciplineRecord> records = dataStore.getDisciplineRecords().values().stream()
                .collect(Collectors.toList());
        return Result.success(records);
    }
}
