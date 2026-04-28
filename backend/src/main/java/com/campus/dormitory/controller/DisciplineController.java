package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.DisciplineRecord;
import com.campus.dormitory.service.DisciplineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discipline")
public class DisciplineController {

    @Autowired
    private DisciplineService disciplineService;

    @GetMapping
    public Result<List<DisciplineRecord>> getAllRecords() {
        return disciplineService.getAllRecords();
    }

    @GetMapping("/student/{studentId}")
    public Result<List<DisciplineRecord>> getRecordsByStudent(@PathVariable String studentId) {
        return disciplineService.getRecordsByStudent(studentId);
    }

    @PostMapping
    public Result<DisciplineRecord> addRecord(@RequestBody DisciplineRecord record) {
        return disciplineService.addDisciplineRecord(record);
    }
}
