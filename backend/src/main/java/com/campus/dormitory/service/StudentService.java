package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.enums.AccommodationStatus;
import com.campus.dormitory.enums.ArrearsStatus;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private DataStore dataStore;

    public Result<List<Student>> getAllStudents() {
        List<Student> students = dataStore.getStudents().values().stream()
                .collect(Collectors.toList());
        return Result.success(students);
    }

    public Result<Student> getStudentById(String studentId) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) {
            return Result.error("学生不存在");
        }
        return Result.success(student);
    }

    public Result<Student> addStudent(Student student) {
        if (dataStore.getStudents().containsKey(student.getStudentId())) {
            return Result.error("学生ID已存在");
        }
        student.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student.setCurrentBedId(null);
        student.setDisciplineCount(0);
        student.setCheckInDate(null);
        dataStore.getStudents().put(student.getStudentId(), student);
        dataStore.getStudentBillMap().put(student.getStudentId(), new java.util.ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student.getStudentId(), new java.util.ArrayList<>());
        return Result.success("学生添加成功", student);
    }

    public Result<Student> updateStudent(Student student) {
        if (!dataStore.getStudents().containsKey(student.getStudentId())) {
            return Result.error("学生不存在");
        }
        Student existing = dataStore.getStudents().get(student.getStudentId());
        if (student.getName() != null) existing.setName(student.getName());
        if (student.getGender() != null) existing.setGender(student.getGender());
        if (student.getCollege() != null) existing.setCollege(student.getCollege());
        if (student.getGrade() != null) existing.setGrade(student.getGrade());
        if (student.getPhone() != null) existing.setPhone(student.getPhone());
        if (student.getArrearsStatus() != null) existing.setArrearsStatus(student.getArrearsStatus());
        dataStore.getStudents().put(existing.getStudentId(), existing);
        return Result.success("学生信息更新成功", existing);
    }
}
